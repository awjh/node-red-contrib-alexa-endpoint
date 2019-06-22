import { Node, NodeProperties, Red } from 'node-red';
import { AlexaHandler } from './utils/alexa-handler';
import { OutputHandler } from './utils/output-handler';

export interface IAlexaListenerConfig extends NodeProperties {
    url: string;
    name: string;
    intents: string[];
}

export interface IAlexaListener extends IAlexaListenerConfig, Node {}

function AlexaListener (RED: Red) {
    class AlexaListenerNode {
        private url: string;
        private name: string;
        private intents: string[];

        constructor (config: IAlexaListenerConfig) {
            const node = this as any as IAlexaListener;

            RED.nodes.createNode(node, config);

            node.name = config.name;
            node.url = config.url;
            node.intents = config.intents || [];

            const eventEmitter = AlexaHandler.listen(RED, node.url);
            eventEmitter.on('INTENT_REQUEST', (msg) => {
                if (msg.payload.session.new) {
                    node.send(OutputHandler.selectOutputFromArray(node.intents, msg.payload.intent, msg));
                }
            });

            node.on('close', () => {
                AlexaHandler.unlisten(RED, node.url, eventEmitter);
                eventEmitter.removeAllListeners();
            });
        }
    }

    RED.nodes.registerType('alexa-listener', AlexaListenerNode as any);
}

module.exports = AlexaListener;
