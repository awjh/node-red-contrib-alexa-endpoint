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

export class AlexaListenerNode extends BaseNode {
    public readonly url: string;
    public readonly intents: string[];
    public readonly eventEmitter: EventEmitter;

    constructor (RED: Red, config: IAlexaListenerConfig) {
        super(RED, config);

        this.url = config.url;
        this.intents = config.intents || [];
        this.eventEmitter = AlexaHandler.listen(RED, config.url);
    }

    public setupNode () {
        super.setupNode();

        (this as any as Node).on('close', this.closeHandler);

        this.eventEmitter.on('INTENT_REQUEST', this.intentHandler);
    }

    private intentHandler (msg) {
        if (msg.payload.session.new) {
            this.send(OutputHandler.selectOutputFromArray(this.intents, msg.payload.intent, msg));
        }
    }

    private closeHandler () {
        AlexaHandler.unlisten(this.RED, this.url, this.eventEmitter);
        this.eventEmitter.removeAllListeners();
    }
}
