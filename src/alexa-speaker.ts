import { speak } from "./utils/speaker";

module.exports = function (RED) {
    function AlexaSpeakerNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        node.message = config.message;

        node.on('input', (msg) => {
            speak(node.message, msg);
        });
    }
    RED.nodes.registerType("alexa-speaker", AlexaSpeakerNode);
}