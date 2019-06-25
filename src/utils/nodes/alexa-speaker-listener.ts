import { Red } from 'node-red';
import { EventEmitter } from '../event-emitter';
import { AlexaListenerNode, IAlexaListener, IAlexaListenerConfig } from './alexa-listener';
import { AlexaSpeakerNode, IAlexaSpeaker, IAlexaSpeakerConfig } from './alexa-speaker';
import { BaseNode } from './base';
import { OutputHandler } from '../output-handler';
import { AlexaHandler } from '../alexa-handler';

export interface IAlexaSpeakerListenerConfig extends IAlexaListenerConfig, IAlexaSpeakerConfig {}
export interface IAlexaSpeakerListener extends IAlexaListener, IAlexaSpeaker {}

export class AlexaSpeakerListenerNode extends BaseNode implements AlexaListenerNode, AlexaSpeakerNode {
    public readonly url: string;
    public readonly intents: string[];
    public readonly eventEmitter: EventEmitter;

    public readonly message: string;

    public readonly currentSessions: string[];

    constructor (RED: Red, config: IAlexaSpeakerListenerConfig) {
        super(RED, config);

        const intentHandler = this.intentHandler;

        Object.assign(this, new AlexaListenerNode(RED, config));
        Object.assign(this, new AlexaListenerNode(RED, config));

        this.intentHandler = intentHandler;
    }

    private setupNode () {
        // needs to call setupNode of AlexaListenerNode and AlexaSpeakerNode
    }

    private intentHandler (msg) {
        if (this.currentSessions.includes(msg.payload.session.sessionId)) {
            const outputs = OutputHandler.selectOutputFromArray(this.intents, msg.payload.intent, msg);

            if (outputs.every((output) => output === null)) {
                AlexaHandler.speak(
                    'Sorry I don\'t understsand your response in this context. ' + this.message,
                    msg,
                    false,
                );
            } else {
                const sessionIndex = this.currentSessions.indexOf(msg.payload.session.sessionId);
                this.currentSessions.splice(sessionIndex, 1);
                this.send(outputs);
            }
        }
    }

    private inputHandler (inputMsg: {[s: string]: any, message: string | boolean | number}) {
        AlexaHandler.speak(this.message, inputMsg, false);

        this.currentSessions.push(inputMsg.payload.session.sessionId);
    }
}
