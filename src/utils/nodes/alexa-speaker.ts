import { Node, NodeProperties, Red } from 'node-red';
import { AlexaHandler } from '../alexa-handler';

export interface IAlexaSpeakerConfig extends NodeProperties {
    message: string;
}

export interface IAlexaSpeaker extends IAlexaSpeakerConfig, Node {}

export class AlexaSpeakerNode {
    public readonly message: string;
    public readonly name: string;

    constructor (RED: Red, config: IAlexaSpeakerConfig) {
        const node = this as any as IAlexaSpeaker;

        RED.nodes.createNode(node, config);

        node.name = config.name;
        node.message = config.message;

        node.on('input', this.inputHandler);
    }

    private inputHandler (msg) {
        AlexaHandler.speak(this.message, msg);
    }
}
