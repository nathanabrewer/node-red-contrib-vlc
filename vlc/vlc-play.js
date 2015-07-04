
module.exports = function(RED) {

    "use strict";

    // The main node definition - most things happen in here
    function vlcPlay(config) {

        RED.nodes.createNode(this,config);

        var node = this;
        var server = RED.nodes.getNode(config.server);

        this.on('input', function (msg) {

          if(server)
            server.inPlay(config.videouri);

        });

        this.on("close", function() {
        });

    }


    RED.nodes.registerType("vlc-play",vlcPlay);


}
