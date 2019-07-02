import { Red } from 'node-red';
import { AlexaSpeakerNode, IAlexaSpeakerConfig } from './utils/nodes/alexa-speaker';

function AlexaSpeaker (RED: Red) {
    class Node extends AlexaSpeakerNode {
        constructor (config: IAlexaSpeakerConfig) {
            super(RED, config) /* istanbul ignore next */;

            this.setupNode();
        }
    }

    RED.nodes.registerType('alexa-speaker', Node as any);
}

module.exports = AlexaSpeaker;
