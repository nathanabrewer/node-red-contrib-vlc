
module.exports = function(RED) {

    "use strict";

    // The main node definition - most things happen in here
    function vlcNode(config) {
        // Create a RED node
        RED.nodes.createNode(this,config);

        var node = this;
        var server = RED.nodes.getNode(config.server);

        this.on('input', function (msg) {
           if (server){
              switch(msg.topic){
                case 'play':
                  server.pause();
                break;
                case 'inPlay':
                  server.inPlay(msg.payload);
                break;
                case 'stop':
                  server.stop();
                break;
                case 'fullscreen':
                  server.fullscreen();
                break;
                case 'pause':
                  server.pause(msg.payload);
                break;
                case 'seek':
                  server.seek(msg.payload);
                break;

            }
            if(typeof msg.cb === 'function'){
              msg.cb(server);
            }
          }else{
            console.log('got payload, but no server to handle it');
          }
        });

        this.on("close", function() {
        });

    }


    RED.nodes.registerType("vlc-node",vlcNode);


}
