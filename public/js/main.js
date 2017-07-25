
var headers = new Headers();
var dl = new DataLink();

var model={
  originalvirtualhosts: [],
  virtualhosts: [],
  details: {name: "seleccione un sitio", show: false, iurl:"", git:{branch:'', repo:''}, user: {name:'', pwd:''}}
};

headers.append('Authorization', 'Basic aW5pdGFkbWluOjFuMXQ0ZG0xbg==');

fetch('/getVirtualHosts', {method: "get", headers: headers})
  .then(resp => resp.json())
  .then(function(data) {
    model.originalvirtualhosts = data;
    model.filtrar();
  });

model.selectme = function(){
  model.details.name = this.name;
  model.details.root = 
    (this.proxypass.name!='') 
      ? `${this.proxypass.name} → ${this.proxypass.proxy}` 
      : this.root;
  model.details.user.name = this.user.name;
  model.details.user.pwd = this.user.pwd;
  model.details.show = true;
  model.details.git.repo = (this.git.repo) ? this.git.repo.split("origin").join("<br>&nbsp;&nbsp;") :'';
  model.details.git.branch = this.git.branch || '';
  $("iframe").src = "http://" + this.subdomain[0]
  model.details.subdomain = (Array.isArray(this.subdomain))? this.subdomain : [];
};


var foundany =function(strs, instr) {
  if (strs.join('') == '') return true;
  return strs.reduce((any, v) => instr.indexOf(v) >-1 && any, true); 
}

model.filtrar = function(){
  let str = $("#filtro").value;
  let virtualhosts = [];
  for (let i=0; i< model.originalvirtualhosts.length; i++){
    let vh = model.originalvirtualhosts[i];
    if (vh.envs) {
      for(let x=0; x < vh.envs.length; x++)
        if (foundany(str.toLowerCase().trim().split(' '), (vh.envs[x].notes.join(" ") + " " + vh.envs[x].subdomain.join(" ")).toLowerCase())) {
          if(!virtualhosts[i]) {
            virtualhosts[i] = (JSON.parse(JSON.stringify(vh)));
            virtualhosts[i].envs= [];
          }
          virtualhosts[i].envs.push(vh.envs[x])
        }
    } else if(!virtualhosts[i]) {
      virtualhosts[i] = JSON.parse(JSON.stringify(vh[i]));
      virtualhosts[i].envs= [];
    }

  };
  model.virtualhosts = virtualhosts.filter(v=> v);
  return str;
};

model.geturl = function(){
  return "http://" + this.toString();
};

model.value = function(){
  return this.toString();
};

dl.Model('model', model);
dl.linker($('body'), model);

$(".clearfilter").onclick = () => {
  $("#filtro").value  = "";
  model.filtrar();
}
