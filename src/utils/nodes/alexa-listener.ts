import { Node, NodeProperties, Red } from 'node-red';
import { AlexaHandler } from '../alexa-handler';
import { EventEmitter } from '../event-emitter';
import { OutputHandler } from '../output-handler';

export interface IAlexaListenerConfig extends NodeProperties {
    url: string;
    name: string;
    intents: string[];
}

export interface IAlexaListener extends IAlexaListenerConfig, Node {}

export class AlexaListenerNode {
    private url: string;
    private name: string;
    private intents: string[];
    private RED: Red;
    private eventEmitter: EventEmitter;

    constructor (RED: Red, config: IAlexaListenerConfig) {
        const node = this as any as IAlexaListener;

        RED.nodes.createNode(node, config);

        this.name = config.name;
        this.url = config.url;
        this.intents = config.intents || [];
        this.RED = RED;
        this.eventEmitter = AlexaHandler.listen(RED, node.url);

        this.eventEmitter.on('INTENT_REQUEST', this.intentHandler);

        node.on('close', this.closeHandler);
    }

    private intentHandler (msg) {
        if (msg.payload.session.new) {
            const node = this as any as IAlexaListener;
            node.send(OutputHandler.selectOutputFromArray(node.intents, msg.payload.intent, msg));
        }
    }

    private closeHandler () {
        AlexaHandler.unlisten(this.RED, this.url, this.eventEmitter);
        this.eventEmitter.removeAllListeners();
    }
}
