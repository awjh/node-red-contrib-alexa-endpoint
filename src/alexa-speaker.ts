import { Red } from 'node-red';
import { registerType } from './utils/node-red';
import { AlexaSpeakerNode, IAlexaSpeakerConfig } from './utils/nodes/alexa-speaker';

function AlexaSpeaker (RED: Red) {
    class Node extends AlexaSpeakerNode {
        constructor (config: IAlexaSpeakerConfig) {
            super(RED, config) /* istanbul ignore next */;

            this.setupNode();
        }
    }
    registerType(RED, 'alexa-speaker', Node);
}

module.exports = AlexaSpeaker;
