import { Red } from 'node-red';
import { AlexaListenerNode, IAlexaListenerConfig } from './utils/nodes/alexa-listener';

function AlexaListener (RED: Red) {
    RED.nodes.registerType('alexa-listener', (config: IAlexaListenerConfig) => {
        const alexaListenerNode = new AlexaListenerNode(RED, config);
        alexaListenerNode.setupNode();
    });
}

module.exports = AlexaListener;
