
module.exports = function(RED) {

    "use strict";
    var http = require("http");
    //var Q = require('q');

    // The main node definition - most things happen in here
    function vlcNode(config) {
        // Create a RED node
        RED.nodes.createNode(this,config);
        var node = this;

        var vlcRequest = function(params, cb){

          var p = '/requests/status.json?n=b';
          for( var field in params )
              p += '&'+field+'='+params[field];
          var reqOptions = {
            host : config.host,
            port : config.port,
            path : p,
            method : 'GET',
            auth : ':' + config.password,
            headers : {
              'Content-Type' : 'application/json'
            }
          };

          var req = http.request(reqOptions, function (response) {
               var buffer = '';
               response.setEncoding('utf8');
               response.on('data', function (chunk) {
                 buffer += chunk;
               });
               response.on('end', function() {
                 var result = JSON.parse(buffer);
                 node.lastResponse = result;
                 if(typeof cb === 'function')
                    cb(result);
               });
          });

          req.on('error', function(err) {
            console.error(err.stack);
            console.error(options);
          });
          req.end();
        };

        //Actual Input
        this.on('input', function (msg) {

          // vlc.status.pause()
          //   .then(vlc.status.play())
          //   .then(vlc.status.fullscreen());

            switch(msg.topic){
              case 'play':
                this.pause();
              break;
              case 'inPlay':
                this.inPlay(encodeURI(msg.payload));
              break;
              case 'stop':
                this.stop();
              break;
              case 'fullscreen':
                this.fullscreen();
              break;
              case 'pause':
                this.pause(msg.payload);
              break;
              case 'seek':
                this.seek(msg.payload);
              break;

          }
          if(typeof msg.cb === 'function'){
            msg.cb(node);
          }
        });

        this.on("close", function() {
        });

        this.play = function(id, cb){
          var params = (id) ? {id:id} : {};
          params.command = 'pl_play';
          vlcRequest(params, cb);
        }

        this.inPlay = function(uri, cb){
          var params = {command:'in_play', input: uri};
          vlcRequest(params, cb);
        }

        this.stop = function(cb){
          var params = {command:'pl_stop'};
          vlcRequest(params, cb);
        }

        this.pause = function(id, cb){
          var params = (id) ? {id:id} : {};
          params.command = 'pl_pause';
          vlcRequest(params, cb);
        }

        this.seek = function(position, cb){
          var params = {command:'seek', val: position};
          vlcRequest(params, cb);
        }

        this.fullscreen = function(reqFullScreen, cb){
          var params = {command:'fullscreen'};

          if(node.lastResponse.fullscreen != reqFullScreen){
            vlcRequest(params, cb);

          }

        }

    }



    RED.nodes.registerType("vlcNode",vlcNode);


}
