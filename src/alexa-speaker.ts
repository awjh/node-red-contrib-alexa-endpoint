import { Red } from 'node-red';
import { AlexaSpeakerNode, IAlexaSpeakerConfig } from './utils/nodes/alexa-speaker';

function AlexaSpeaker (RED: Red) {
    RED.nodes.registerType('alexa-speaker', (config: IAlexaSpeakerConfig) => new AlexaSpeakerNode(RED, config));
}

module.exports = AlexaSpeaker;
