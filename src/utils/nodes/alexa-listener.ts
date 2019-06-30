import { Node, NodeProperties, NodeType, Red } from 'node-red';
import { AlexaHandler } from '../alexa-handler';
import { EventEmitter } from '../event-emitter';
import { OutputHandler } from '../output-handler';
import { BaseNode } from './base';

export interface IAlexaListenerConfig extends NodeProperties {
    url: string;
    intents: string[];
}

export interface IAlexaListener extends IAlexaListenerConfig, Node {}

export interface IAlexaListenerNode {
    url: string;
    intents: string[];
    eventEmitter: EventEmitter;
}

export class AlexaListenerNode extends BaseNode implements IAlexaListenerNode {
    public readonly url: string;
    public readonly intents: string[];
    public readonly eventEmitter: EventEmitter;

    constructor (RED: Red, config: IAlexaListenerConfig) {
        super(RED, config) /* istanbul ignore next */;

        this.url = config.url;
        this.intents = config.intents || [];
        this.eventEmitter = AlexaHandler.listen(RED, config.url);
    }

    public setupNode () {
        super.setupNode();

        const node = this;

        node.on('close', () => {
            node.closeHandler();
        });

        this.eventEmitter.on('INTENT_REQUEST', (msg) => {
            node.intentHandler(msg);
        });
    }

    private intentHandler (msg) {
        if (msg.payload.session.new) {
            msg.actioned = true;
            this.send(OutputHandler.selectOutputFromArray(this.intents, msg.payload.intent, msg));
        }
    }

    private closeHandler () {
        AlexaHandler.unlisten(this.RED, this.url, this.eventEmitter);
        this.eventEmitter.removeAllListeners();
    }
}
