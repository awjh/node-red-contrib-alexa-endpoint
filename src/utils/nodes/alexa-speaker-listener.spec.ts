import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { AlexaHandler } from '../alexa-handler';
import { EventEmitter } from '../event-emitter';
import { OutputHandler } from '../output-handler';
import { AlexaListenerNode } from './alexa-listener';
import { AlexaSpeakerNode } from './alexa-speaker';
import { AlexaSpeakerListenerNode, IAlexaSpeakerListenerConfig } from './alexa-speaker-listener';

const expect = chai.expect;
chai.use(sinonChai);

// tslint:disable: no-unused-expression
describe ('#AlexaSpeakerListenerNode', () => {
    let sandbox: sinon.SinonSandbox;

    let mockConfig: IAlexaSpeakerListenerConfig;

    let mockEventEmitter: sinon.SinonStubbedInstance<EventEmitter>;

    let mockRED: {
        nodes: {
            createNode: sinon.SinonStub;
            registerType: sinon.SinonStub;
        },
    };

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        mockEventEmitter = sandbox.createStubInstance(EventEmitter);

        sandbox.stub(AlexaHandler, 'listen').returns(mockEventEmitter);

        mockConfig = {
            id: 'some type',
            intents: ['some', 'intents'],
            message: 'some message',
            name: 'some name',
            type: 'some type',
            url: 'some url',
        };

        mockRED = {
            nodes: {
                createNode: sinon.stub(),
                registerType: sinon.stub(),
            },
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe ('constructor', () => {
        it ('should assign values using speaker and listener nodes', () => {
            const listenerSetup = sandbox.stub(AlexaListenerNode.prototype, 'setupNode');
            const speakerSetup = sandbox.stub(AlexaSpeakerNode.prototype, 'setupNode');
            const listenerCloseHandler = sandbox.stub(AlexaListenerNode.prototype, 'closeHandler');

            const alexaSpeakerListenerNode = new AlexaSpeakerListenerNode(mockRED as any, mockConfig);

            expect(alexaSpeakerListenerNode.name).to.deep.equal('some name');
            expect(alexaSpeakerListenerNode.url).to.deep.equal('some url');
            expect(alexaSpeakerListenerNode.intents).to.deep.equal(['some', 'intents']);
            expect(alexaSpeakerListenerNode.eventEmitter).to.deep.equal(mockEventEmitter);
            expect(alexaSpeakerListenerNode.message).to.deep.equal('some message');

            expect((alexaSpeakerListenerNode as any).setupListenerNode).to.deep.equal(listenerSetup);
            expect((alexaSpeakerListenerNode as any).setupSpeakerNode).to.deep.equal(speakerSetup);

            expect((alexaSpeakerListenerNode as any).closeHandler).to.deep.equal(listenerCloseHandler);
        });
    });

    describe ('setupNode', () => {
        it ('should call setup for listener and speaker', () => {
            const listenerSetup = sandbox.stub(AlexaListenerNode.prototype, 'setupNode');
            const speakerSetup = sandbox.stub(AlexaSpeakerNode.prototype, 'setupNode');

            const alexaSpeakerListenerNode = new AlexaSpeakerListenerNode(mockRED as any, mockConfig);

            alexaSpeakerListenerNode.setupNode();

            expect(listenerSetup).to.have.been.calledOnceWithExactly();
            expect(speakerSetup).to.have.been.calledOnceWithExactly();
        });
    });

    describe ('intentHandler', () => {
        let alexaSpeakerListenerNode: AlexaSpeakerListenerNode;
        let sendStub: sinon.SinonStub;
        let selectOutputStub: sinon.SinonStub;
        let speakStub: sinon.SinonStub;

        let fakeMessage;

        beforeEach(() => {
            selectOutputStub = sandbox.stub(OutputHandler, 'selectOutputFromArray').returns(['some output']);
            speakStub = sandbox.stub(AlexaHandler, 'speak');

            alexaSpeakerListenerNode = new AlexaSpeakerListenerNode(mockRED as any, mockConfig);
            (alexaSpeakerListenerNode as any).currentSessions = ['some id', 'another id'];

            fakeMessage = {
                payload: {
                    intent: 'intent',
                    session: {
                        new: true,
                        sessionId: 'some id',
                    },
                },
            };

            sendStub = sandbox.stub(alexaSpeakerListenerNode, 'send');
        });

        it ('should do nothing when id not in current stored sessions', () => {
            fakeMessage.payload.session.sessionId = 'some bad id';

            (alexaSpeakerListenerNode as any).intentHandler(fakeMessage);

            expect(speakStub).to.not.have.been.called;
            expect(selectOutputStub).to.not.have.been.called;
            expect(sendStub).to.not.have.been.called;
        });

        it ('should speak and not send if all outputs null', () => {
            selectOutputStub.returns([null, null]);

            (alexaSpeakerListenerNode as any).intentHandler(fakeMessage);

            expect(selectOutputStub).to.have.been.calledOnceWithExactly(
                alexaSpeakerListenerNode.intents, 'intent', fakeMessage,
            );
            expect(speakStub).to.have.been.calledOnceWithExactly(
                'Sorry I don\'t understand your response in this context. Please try again.',
                fakeMessage,
                false,
            );
            expect(sendStub).to.have.not.been.called;
        });

        it ('should not speak but send when an output found and remove id from current sessions', () => {
            const fakeOutputs = [null, 'some value'];
            selectOutputStub.returns(fakeOutputs);

            (alexaSpeakerListenerNode as any).intentHandler(fakeMessage);

            expect(selectOutputStub).to.have.been.calledOnceWithExactly(
                mockConfig.intents, 'intent', fakeMessage,
            );
            expect(speakStub).to.not.have.been.called;
            expect(sendStub).to.have.been.calledOnceWithExactly(fakeOutputs);
            expect(alexaSpeakerListenerNode.currentSessions).to.deep.equal(['another id']);
        });
    });

    describe ('inputHandler', () => {
        it ('should speak the message and add session id to list', () => {
            const speakStub = sandbox.stub(AlexaHandler, 'speak');

            const fakeMessage = {
                payload: {
                    intent: 'intent',
                    session: {
                        new: true,
                        sessionId: 'another id',
                    },
                },
            };

            const alexaSpeakerListenerNode = new AlexaSpeakerListenerNode(mockRED as any, mockConfig);
            (alexaSpeakerListenerNode as any).currentSessions = ['some id'];

            (alexaSpeakerListenerNode as any).inputHandler(fakeMessage);

            expect(speakStub).to.have.been.calledOnceWithExactly(mockConfig.message, fakeMessage, false);
            expect(alexaSpeakerListenerNode.currentSessions).to.deep.equal(['some id', 'another id']);
        });
    });
});
