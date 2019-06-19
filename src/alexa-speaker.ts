import { AlexaHandler } from "./utils/alexa-handler";

module.exports = function (RED) {
    function AlexaSpeakerNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        node.message = config.message;

        node.on('input', (msg) => {
            AlexaHandler.speak(node.message, msg);
        });
    }
    RED.nodes.registerType("alexa-speaker", AlexaSpeakerNode);
}