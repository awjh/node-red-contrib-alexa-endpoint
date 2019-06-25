import { Node, NodeProperties, Red } from 'node-red';
import { AlexaHandler } from '../alexa-handler';
import { BaseNode } from './base';

export interface IAlexaSpeakerConfig extends NodeProperties {
    message: string;
}

export interface IAlexaSpeaker extends IAlexaSpeakerConfig, Node {
    setupNode: () => void;
}

export class AlexaSpeakerNode extends BaseNode {
    public readonly message: string;

    constructor (RED: Red, config: IAlexaSpeakerConfig) {
        super(RED, config);

        this.message = config.message;
    }

    public setupNode () {
        super.setupNode();

        const node = this;

        node.on('input', (msg) => {
            node.inputHandler(msg);
        });
    }

    private inputHandler (msg) {
        AlexaHandler.speak(this.message, msg);
    }
}
