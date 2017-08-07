var upload;
window.onload = function() {

   upload = {
      showInfo : function(message) {
         //upload.hide('div.progress');
         //upload.hide('#formupload');
      },
       uploadfile : function(evt) {

         evt.preventDefault();
         //upload.hide('div.progress');
         //upload.hide('#formupload');

         var formData = new FormData();
         var file = document.getElementById('file').files[0];

         formData.append('myFile', file);

         var xhr = new XMLHttpRequest();

         xhr.open('post', '/u', true);
         xhr.upload.onprogress = function(e) {

            if (e.lengthComputable) {
               var percentage = (e.loaded / e.total) * 100;
              document.querySelectorAll('div.downloadmanager')[0].style.width = percentage + '%';
            }
         };

         xhr.onerror = function(e) {
           upload.showInfo('An error occurred while submitting the form. Maybe your file is too big');
         };

         xhr.onload = function() {
            upload.showInfo(this.statusText);
         };

         xhr.send(formData);
      }
   };
};
