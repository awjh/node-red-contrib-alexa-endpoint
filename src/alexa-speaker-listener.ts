import { AlexaHandler } from "./utils/alexa-handler";
import { OutputHandler } from "./utils/output-handler";
import { Red } from "node-red";
import { IAlexaSpeaker, IAlexaSpeakerConfig } from "./alexa-speaker";
import { IAlexaListener, IAlexaListenerConfig } from "./alexa-listener";

interface IAlexaSpeakerListenerConfig extends IAlexaListenerConfig, IAlexaSpeakerConfig {}
interface IAlexaSpeakerListener extends IAlexaListener, IAlexaSpeaker {}

function AlexaSpeakerListener(RED: Red) {

    class AlexaSpeakerListenerNode {
        constructor (config: IAlexaSpeakerListenerConfig) {
            const node = this as any as IAlexaSpeakerListener;
            
            RED.nodes.createNode(node, config);

            node.message = config.message;
            node.url = config.url;
            node.intents = config.intents || [];

            node.on('input', (inputMsg) => {
                AlexaHandler.speak(node.message, inputMsg, false);

                const sessionId = inputMsg.payload.session.sessionId;

                try {
                    const eventEmitter = AlexaHandler.listen(RED, node.url);
                    eventEmitter.on('INTENT_REQUEST', (msg) => {
                        if (msg.payload.session.sessionId === sessionId) {
                            const outputs = OutputHandler.selectOutputFromArray(node.intents, msg.payload.intent, msg);
                        
                            if (outputs.every((output) => output === null)) {
                                AlexaHandler.speak('Sorry I don\'t understsand your response in this context. ' + node.message, msg, false);
                            } else {
                                AlexaHandler.unlisten(RED, node.url, eventEmitter);
                                eventEmitter.removeAllListeners();
                                node.send(outputs);
                            }
                        }
                    });
                } catch (err) {
                    console.log(err);
                }
            });
        }
    }

    RED.nodes.registerType("alexa-speaker-listener", AlexaSpeakerListenerNode as any);
}

module.exports = AlexaSpeakerListener;
