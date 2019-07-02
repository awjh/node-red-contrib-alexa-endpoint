import { Red } from 'node-red';
import { AlexaListenerNode, IAlexaListenerConfig } from './utils/nodes/alexa-listener';

function AlexaListener (RED: Red) {
    class Node extends AlexaListenerNode {
        constructor (config: IAlexaListenerConfig) {
            super(RED, config) /* istanbul ignore next */;

            this.setupNode();
        }
    }

    RED.nodes.registerType('alexa-listener', Node as any);
}

module.exports = AlexaListener;
