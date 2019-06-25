import { Red } from 'node-red';
import { AlexaSpeakerListenerNode, IAlexaSpeakerListenerConfig } from './utils/nodes/alexa-speaker-listener';

function AlexaSpeakerListener (RED: Red) {

    class Node extends AlexaSpeakerListenerNode {
        constructor (config: IAlexaSpeakerListenerConfig) {
            super(RED, config);

            this.setupNode();
        }
    }

    RED.nodes.registerType('alexa-speaker-listener', Node as any);
}
module.exports = AlexaSpeakerListener;
