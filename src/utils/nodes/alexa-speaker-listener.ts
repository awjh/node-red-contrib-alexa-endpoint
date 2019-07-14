import { Red } from 'node-red';
import { AlexaHandler } from '../alexa-handler';
import { EventEmitter } from '../event-emitter';
import { OutputHandler } from '../output-handler';
import { AlexaListenerNode, IAlexaListener, IAlexaListenerConfig, IAlexaListenerNode } from './alexa-listener';
import { AlexaSpeakerNode, IAlexaSpeaker, IAlexaSpeakerConfig, IAlexaSpeakerNode } from './alexa-speaker';
import { BaseNode } from './base';

export interface IAlexaSpeakerListenerConfig extends IAlexaListenerConfig, IAlexaSpeakerConfig {}
export interface IAlexaSpeakerListener extends IAlexaListener, IAlexaSpeaker {}
interface IAlexaSpeakerListenerNode extends IAlexaListenerNode, IAlexaSpeakerNode {}

export class AlexaSpeakerListenerNode extends BaseNode implements IAlexaSpeakerListenerNode {
    public readonly currentSessions: Map<string, NodeJS.Timeout>;

    // LISTENER PROPERTIES
    public readonly url: string;
    public readonly intents: string[];
    public readonly eventEmitter: EventEmitter;

    // SPEAKER PROPERTIES
    public readonly message: string;

    private alexaListener: AlexaListenerNode;
    private alexaSpeaker: AlexaSpeakerNode;

    private setupListenerNode: () => void;
    private setupSpeakerNode: () => void;

    constructor (RED: Red, config: IAlexaSpeakerListenerConfig) {
        super(RED, config) /* istanbul ignore next */;

        this.alexaListener = new AlexaListenerNode(RED, config);
        this.alexaSpeaker = new AlexaSpeakerNode(RED, config);

        const node = this;

        Object.keys(this.alexaListener).forEach((key) => {
            node[key] = node.alexaListener[key];
        });

        Object.keys(this.alexaSpeaker).forEach((key) => {
            node[key] = node.alexaSpeaker[key];
        });

        this.setupListenerNode = this.alexaListener.setupNode;
        this.setupSpeakerNode = this.alexaSpeaker.setupNode;

        this.closeHandler = (this.alexaListener as any).closeHandler;

        this.currentSessions = new Map();
    }

    public setupNode () {
        this.setupListenerNode();
        this.setupSpeakerNode();
    }

    protected intentHandler (msg) {
        const sessionId = msg.payload.session.sessionId;

        if (!msg.payload.session.new && this.currentSessions.has(sessionId)) {
            msg.actioned = true;

            const outputs = OutputHandler.selectOutputFromArray(this.intents, msg.payload.intent, msg);

            if (outputs.every((output) => output === null)) {
                AlexaHandler.speak(
                    'Sorry I don\'t understand your response in this context. Please try again.',
                    msg,
                    false,
                );

                clearTimeout(this.currentSessions.get(sessionId));
                this.currentSessions.set(sessionId, this.generateTimeout(sessionId));
            } else {
                this.currentSessions.delete(sessionId);
                this.send(outputs);
            }
        }
    }

    protected inputHandler (inputMsg: {[s: string]: any, message: string | boolean | number}) {
        AlexaHandler.speak(this.message, inputMsg, false);

        const sessionId = inputMsg.payload.session.sessionId;

        this.currentSessions.set(sessionId, this.generateTimeout(sessionId));
    }

    // istanbul ignore next
    // tslint:disable-next-line:no-empty
    protected closeHandler () {} // gets overwritten

    private generateTimeout (sessionId: string): any {
        return setTimeout(() => {
            this.currentSessions.delete(sessionId);
        }, 30000);
    }
}
