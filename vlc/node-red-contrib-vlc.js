
module.exports = function(RED) {

    "use strict";
    var http = require("http");
    var Q = require('q');

    // The main node definition - most things happen in here
    function vlcNode(config) {
        // Create a RED node
        RED.nodes.createNode(this,config);
        var node = this;

        var vlcRequest = function(params, deferred){
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

                 deferred.resolve(node, result);

               });
          });

          req.on('error', function(err) {
              deferred.reject(node, err);
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

        this.play = function(id){
          var deferred = Q.defer();
          var params = {command:'pl_stop'};
          if(id) params.id = id;
          vlcRequest(params,deferred);

          return deferred.promise;
        }

        this.inPlay = function(uri){
          var deferred = Q.defer();
          var params = {command:'in_play', input: uri};
          vlcRequest(params,deferred);

          return deferred.promise;
        }

        this.stop = function(cb){
          var deferred = Q.defer();
          var params = {command:'pl_stop'};
          vlcRequest(params,deferred);

          return deferred.promise;
        }

        this.pause = function(id){
          var deferred = Q.defer();
          var params = {command:'pl_pause'};
          if(id) params.id = id;
          vlcRequest(params,deferred);

          return deferred.promise;
        }

        this.seek = function(position){
          var deferred = Q.defer();
          var params = {command:'seek', val: position};
          vlcRequest(params,deferred);

          return deferred.promise;
        }

        this.fullscreen = function(reqFullScreen){
          var deferred = Q.defer();
          var params = {command:'fullscreen'};

          if(node.lastResponse.fullscreen != reqFullScreen){
            vlcRequest(params,deferred);
          }else{
            //just for the sake of returning this promise
            setTimeout(function(){deferred.resolve();}, 100);
          }
          return deferred.promise;

        }

        this.wait = function(time){
          var deferred = Q.defer();
          setTimeout(function(){ deffered.resolve(); }(deferred),time);

         return deferred.promise;
        }
    }



    RED.nodes.registerType("vlcNode",vlcNode);


}
