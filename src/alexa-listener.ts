import { EventEmitter } from 'events';
import { AlexaHandler } from './utils/alexa-handler';

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
                const intents = this.intents as string[];
                const outputs = [];
        
                node.intents.forEach(() => {
                    outputs.push(null);
                });
        
                if (intents.includes(msg.payload.intent)) {            
                    outputs[intents.indexOf(msg.payload.intent)] = msg;
        
                    node.send(outputs);
                }
            }
        });

        node.on('close', () => {
            AlexaHandler.unlisten(RED, node.url, eventEmitter);
            eventEmitter.removeAllListeners();
        });
    }
    RED.nodes.registerType("alexa-listener", AlexaListenerNode);
}