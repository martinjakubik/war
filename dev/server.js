var oHttp = require("http");
var oUrl = require("url");
var oFs = require("fs");
var oPath = require("path");
var sBaseDirectory = ".";

var port = 1995;

oHttp.createServer(function (oRequest, oResponse) {
   try {
     var oRequestUrl = oUrl.parse(oRequest.url);

     var sPath = oRequestUrl.pathname;

     // need to use oPath.normalize so people can't access directories underneath sBaseDirectory
     var sFSPath = sBaseDirectory + oPath.normalize(sPath);
     console.log("path: \"" + sFSPath + "\"");

     var sContentType = "text/plain";

     if (sFSPath.includes("/css/")) {
         sContentType = "text/css";
     } else if (sFSPath.includes("/html/")) {
         sContentType = "text/html";
     } else if (sFSPath.includes("/js/")) {
         sContentType = "application/javascript";
     }

     var oHeaders =  {
        "Content-Type": sContentType
     };

     oResponse.writeHead(200, oHeaders);
     var oFileStream = oFs.createReadStream(sFSPath);
     oFileStream.pipe(oResponse);
     oFileStream.on('error',function(e) {
         // assumes the file doesn't exist
         oResponse.writeHead(404);
         oResponse.end()
     });
   } catch(e) {
     oResponse.writeHead(500);

     // ends the oResponse so browsers don't hang
     oResponse.end();
     console.log(e.stack)
   }
}).listen(port);

console.log("listening on port \"" + port + "\"");
