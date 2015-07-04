
module.exports = function(RED) {

    "use strict";
    var http = require("http");
    var Q = require('q');

    function vlcServer(config) {
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
                 deferred.resolve(result);
               });
          });
          req.on('error', function(err) {
              deferred.reject(err);
          });
          req.end();
        };

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
          node.warn("Loading "+uri);
          vlcRequest(params,deferred);

          return deferred.promise;
        }

        this.stop = function(cb){
          var deferred = Q.defer();
          var params = {command:'pl_stop'};
          node.warn("Stop ");
          vlcRequest(params,deferred);

          return deferred.promise;
        }

        this.pause = function(id){
          var deferred = Q.defer();
          var params = {command:'pl_pause'};
          if(id) params.id = id;
          node.warn("Pause ");
          vlcRequest(params,deferred);

          return deferred.promise;
        }

        this.seek = function(position){
          var deferred = Q.defer();
          var params = {command:'seek', val: position};
          node.warn("[nrVLC]: Seek "+position);
          vlcRequest(params,deferred);

          return deferred.promise;
        }

        this.fullscreen = function(reqFullScreen){
          var deferred = Q.defer();
          var params = {command:'fullscreen'};

          if(node.lastResponse.fullscreen != reqFullScreen){
            node.warn("Fullscreen request ");
            vlcRequest(params,deferred);
          }else{
            //just for the sake of returning this promise
            node.warn("Fullscreen, already in requested state, ignoring ");
            setTimeout(function(){deferred.resolve();}, 100);
          }
          return deferred.promise;

        }

    }
    RED.nodes.registerType("vlc-server",vlcServer);

}
