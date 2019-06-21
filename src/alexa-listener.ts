import { EventEmitter } from 'events';
import { Red, Node } from 'node-red';
import { AlexaHandler } from './utils/alexa-handler';
import { OutputHandler } from './utils/output-handler';

export function AlexaListener (RED: Red) {

    class AlexaListenerNode {
        private url;
        private name;
        private intents;

        constructor (config) {
            // TODO TEST THAT CAN MAKE THIS CONSTRUCTOR STYLE AND NODE CAN WORK AS TYPE IDEALLY CLASS WOULD EXTEND THE NODE-RED NODE CLASS
            RED.nodes.createNode(this as any, config);

            this.name = config.name;        
            this.url = config.url;        
            this.intents = config.intents || [];

            const node = this as any as Node;
    
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
    
    RED.nodes.registerType("alexa-listener", AlexaListenerNode);
}

module.exports = AlexaListener;