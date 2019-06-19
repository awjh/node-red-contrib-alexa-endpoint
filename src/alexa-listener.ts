import { EventEmitter } from 'events';
import { AlexaHandler } from './utils/alexa-handler';
import { OutputHandler } from './utils/output-handler';

module.exports = function(RED) {

    function AlexaListenerNode(config) {
        RED.nodes.createNode(this,config);

        const node = this;
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
    RED.nodes.registerType("alexa-listener", AlexaListenerNode);
}