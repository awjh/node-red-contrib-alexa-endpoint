import { Red } from 'node-red';
import { registerType } from './utils/node-red';
import { AlexaListenerNode, IAlexaListenerConfig } from './utils/nodes/alexa-listener';

function AlexaListener (RED: Red) {
    class Node extends AlexaListenerNode {
        constructor (config: IAlexaListenerConfig) {
            super(RED, config) /* istanbul ignore next */;

            this.setupNode();
        }
    }
    registerType(RED, 'alexa-listener', Node);
}

module.exports = AlexaListener;
