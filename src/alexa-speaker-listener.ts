import { Red } from 'node-red';
import { registerType } from './utils/node-red';
import { AlexaSpeakerListenerNode, IAlexaSpeakerListenerConfig } from './utils/nodes/alexa-speaker-listener';

function AlexaSpeakerListener (RED: Red) {

    class Node extends AlexaSpeakerListenerNode {
        constructor (config: IAlexaSpeakerListenerConfig) {
            super(RED, config) /* istanbul ignore next */;

            this.setupNode();
        }
    }
    registerType(RED, 'alexa-speaker-listener', Node);
}
module.exports = AlexaSpeakerListener;
