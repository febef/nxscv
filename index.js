const express = require('express');
const fs = require('fs');
const nginxSites = '/etc/nginx/sites-enabled';
const execSync = require('child_process').execSync;

var app = express();

var getConfs = function(){
  let files = [];
  fs.readdirSync(nginxSites).forEach(file => {
    if(file!="" && file && file[0]!=".") {
      files.push({name: file, data: fs.readFileSync(nginxSites + '/' + file, 'utf8').toString()});
    }
  });
  return files;
}

var getBetweenOf = (start, end, str='') => {
  let a = str.split(start)[1];
  return  (a ) ? a.split(end)[0] : '';
}

var getGitData = function(repoPath) {
  try{
   branch = execSync(`cd ${repoPath}; git branch`).toString();
   repo = execSync(`cd ${repoPath}; git remote -v`).toString();
   return {
     branch: getBetweenOf('* ', '\n', branch),
     repo: repo
   };
  } catch (err){
    return { err };
  }
}

var strClearFormat = (str) => str.replace(/\r?\n|\r|\n/g,'').replace(/\s+/g,' ');
// prd.sm.initcosnultants.com

var getDomainbase = function(domain) {

  var supers = 'conf;org;com;ar;us;es;mx;net;bo;ch;br';
  var splDomain = domain.split(".");
  var bdom = "", i;

  for (i = splDomain.length-2; i> 0; i--)
    if (supers.indexOf(splDomain[i]) > -1)
      bdom = splDomain[i] + "." + bdom;
    else
      break;

  return splDomain[i] + "." + bdom;
}

var getUpstream = function(config){
  if (!config) return;
  let upstream = strClearFormat(getBetweenOf("upstream ","}", config)).split('{');
  let proxy = strClearFormat(getBetweenOf('server',';', upstream[1]));
  return {
    name: (proxy && proxy !='') ? strClearFormat(upstream[0]) : '',
    proxy
  };
}

var getEnvs = function(){

  let configs = getConfs();
  let envs = {};
  for (let i=0; i < configs.length; i++) {
    let domains = strClearFormat(getBetweenOf("server_name", ";", configs[i].data));
    let root = "/" + strClearFormat(getBetweenOf("root /", ";", configs[i].data));
    let notes = strClearFormat(getBetweenOf("#notes:",";", configs[i].data)).split("|");
    let pwd = strClearFormat(getBetweenOf("#password:",";", configs[i].data));
    let usr = strClearFormat(getBetweenOf("#user:",";", configs[i].data));
    let proxypass = getUpstream(configs[i].data);
    let gitData = getGitData(root);
    let dbase = getDomainbase(configs[i].name);
    if (!envs[dbase]) envs[dbase] = {};
    envs[dbase][configs[i].name] = {
      name: configs[i].name,
      notes: notes,
      subdomain: domains.split(" ").map(domain => strClearFormat(domain).split("conf")[0]).filter(v => v!=""),
      root: root,
      git: gitData,
      user: {name: usr, pwd},
      proxypass
    };
  }
  return envs;
};

var objecttoarray = function(obj){
  let arr= [];
  let so;
  for (p in obj)
  {
    so= {name:p, envs:[]}
    for (pp in obj[p])
      so.envs.push(obj[p][pp]);

    arr.push(so);
  }
  return arr;
}

var envstoArr = function(envs){
  var arr = objecttoarray(envs);
  
  return arr;
}

app.set('view engine', 'pug');
app.set('views', './views');
app.use('/', express.static('./public'));

app.get('/getVirtualHosts', function (req, res) {
  res.send(envstoArr(getEnvs()));
});

app.get('/', function(req, res) {

  res.render('index');

});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
