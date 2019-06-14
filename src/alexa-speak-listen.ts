import { speak } from "./utils/speaker";
import { AlexaHandler } from "./utils/alexa-handler";

module.exports = function (RED) {
    function AlexaSpeakerNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        node.message = config.message;
        node.url = config.url;

        node.on('input', (msg) => {
            speak(node.message, msg, false);

            const sessionId = msg.payload.session.sessionId;

            try {
                const eventEmitter = AlexaHandler.listen(RED, node.url);
                eventEmitter.on('INTENT_REQUEST', (msg) => {
                    console.log(msg);
                    // Todo check session ID and then send msg to output if matches
    
                    AlexaHandler.unlisten(RED, node.url, eventEmitter);
                    eventEmitter.removeAllListeners();
                });
            } catch (err) {
                console.log(err);
            }
        });
    }
    RED.nodes.registerType("alexa-speak-listen", AlexaSpeakerNode);
}