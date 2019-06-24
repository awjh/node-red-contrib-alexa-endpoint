import { Red } from 'node-red';
import { AlexaListenerNode, IAlexaListenerConfig } from './utils/nodes/alexa-listener';

function AlexaListener (RED: Red) {
    RED.nodes.registerType('alexa-listener', (config: IAlexaListenerConfig) => new AlexaListenerNode(RED, config));
}

module.exports = AlexaListener;
