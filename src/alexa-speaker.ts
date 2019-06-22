import { Red, Node, NodeProperties } from 'node-red';
import { AlexaHandler } from "./utils/alexa-handler";

export interface IAlexaSpeakerConfig extends NodeProperties {
    message: string;
}

export interface IAlexaSpeaker extends IAlexaSpeakerConfig, Node {}

function AlexaSpeaker (RED: Red) {

    class AlexaSpeakerNode {
        private message: string;

        constructor (config: IAlexaSpeakerConfig) {
            const node = this as any as IAlexaSpeaker;
            
            RED.nodes.createNode(node, config);

            node.message = config.message;

            node.on('input', (msg) => {
                AlexaHandler.speak(node.message, msg);
            });
        }
    }

    RED.nodes.registerType("alexa-speaker", AlexaSpeakerNode as any);
}

module.exports = AlexaSpeaker;
