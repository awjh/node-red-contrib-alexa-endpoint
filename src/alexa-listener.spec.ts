import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as AlexaListener from './alexa-listener';
import { AlexaHandler } from './utils/alexa-handler';
import { EventEmitter } from './utils/event-emitter';
import { OutputHandler } from './utils/output-handler';

const expect = chai.expect;
chai.use(sinonChai);

// tslint:disable: no-unused-expression
describe ('#alexa-listener', () => {

    let sandbox: sinon.SinonSandbox;

    let mockRED: {
        nodes: {
            createNode: sinon.SinonStub;
            registerType: sinon.SinonStub;
        },
    };

    beforeEach(() => {
        sandbox = sinon.createSandbox();
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

    it ('should register the type', async () => {
        (AlexaListener as any)(mockRED);

        expect(mockRED.nodes.registerType).to.have.been.calledOnceWithExactly('alexa-listener', sinon.match.func);
    });

    describe ('AlexaListenerNode', () => {
        let AlexaListenerNode;

        let mockConfig: AlexaListener.IAlexaListenerConfig;

        let alexaHandlerListenStub: sinon.SinonStub;

        let mockEventEmitter: sinon.SinonStubbedInstance<EventEmitter>;

        beforeEach(() => {
            (AlexaListener as any)(mockRED);

            AlexaListenerNode = mockRED.nodes.registerType.getCall(0).args[1];

            mockEventEmitter = sandbox.createStubInstance(EventEmitter);

            alexaHandlerListenStub = sandbox.stub(AlexaHandler, 'listen').returns(mockEventEmitter);

            mockConfig = {
                id: 'some type',
                intents: ['some', 'intents'],
                name: 'some name',
                type: 'some type',
                url: 'some url',
            };
        });

        it ('should assign values when constructed, create node and listen', () => {
            mockRED.nodes.createNode.callsFake((node) => {
                node.on = sinon.stub();
            });

            const alexaListenerNode = new AlexaListenerNode(mockConfig);

            expect(alexaListenerNode.name).to.deep.equal('some name');
            expect(alexaListenerNode.url).to.deep.equal('some url');
            expect(alexaListenerNode.intents).to.deep.equal(['some', 'intents']);

            expect(mockRED.nodes.createNode).to.have.been.calledOnceWithExactly(alexaListenerNode, mockConfig);
            expect(alexaHandlerListenStub).to.have.been.calledOnceWithExactly(mockRED, 'some url');
            expect(mockEventEmitter.on).to.have.been.calledOnceWithExactly('INTENT_REQUEST', sinon.match.func);
            expect(alexaListenerNode.on).to.have.been.calledOnceWithExactly('close', sinon.match.func);
        });

        it ('should handle no intent passed in config', () => {
            mockRED.nodes.createNode.callsFake((node) => {
                node.on = sinon.stub();
            });

            delete mockConfig.intents;

            const alexaListenerNode = new AlexaListenerNode(mockConfig);

            expect(alexaListenerNode.name).to.deep.equal('some name');
            expect(alexaListenerNode.url).to.deep.equal('some url');
            expect(alexaListenerNode.intents).to.deep.equal([]);

            expect(mockRED.nodes.createNode).to.have.been.calledOnceWithExactly(alexaListenerNode, mockConfig);
            expect(alexaHandlerListenStub).to.have.been.calledOnceWithExactly(mockRED, 'some url');
            expect(mockEventEmitter.on).to.have.been.calledOnceWithExactly('INTENT_REQUEST', sinon.match.func);
            expect(alexaListenerNode.on).to.have.been.calledOnceWithExactly('close', sinon.match.func);
        });

        describe ('event emitter callback', () => {
            it ('should call send when new session', () => {
                mockRED.nodes.createNode.callsFake((node) => {
                    node.on = sinon.stub();
                    node.send = sinon.stub();
                });

                const selectOutputStub = sandbox.stub(OutputHandler, 'selectOutputFromArray').returns(['some output']);

                const alexaListenerNode = new AlexaListenerNode(mockConfig);

                const eventEmitterCallback = mockEventEmitter.on.getCall(0).args[1];

                const fakeMessage = {
                    payload: {
                        intent: 'intent',
                        session: {
                            new: true,
                        },
                    },
                };

                eventEmitterCallback(fakeMessage);

                expect(selectOutputStub).to.have.been.calledOnceWithExactly(['some', 'intents'], 'intent', fakeMessage);
                expect(alexaListenerNode.send).to.have.been.calledOnceWithExactly(['some output']);
            });

            it ('should do nothing when not a new session', () => {
                mockRED.nodes.createNode.callsFake((node) => {
                    node.on = sinon.stub();
                    node.send = sinon.stub();
                });

                const selectOutputStub = sandbox.stub(OutputHandler, 'selectOutputFromArray').returns(['some output']);

                const alexaListenerNode = new AlexaListenerNode(mockConfig);

                const eventEmitterCallback = mockEventEmitter.on.getCall(0).args[1];

                const fakeMessage = {
                    payload: {
                        intent: 'intent',
                        session: {
                            new: false,
                        },
                    },
                };

                eventEmitterCallback(fakeMessage);

                expect(selectOutputStub).to.not.have.been.called;
                expect(alexaListenerNode.send).to.not.have.been.called;
            });
        });

        describe ('node close callback', () => {
            it ('should close listeners', () => {
                mockRED.nodes.createNode.callsFake((node) => {
                    node.on = sinon.stub();
                });

                const unlistenStub = sandbox.stub(AlexaHandler, 'unlisten');

                const alexaListenerNode = new AlexaListenerNode(mockConfig);

                const closeCallback = alexaListenerNode.on.getCall(0).args[1];

                closeCallback();

                expect(unlistenStub).to.have.been.calledOnceWithExactly(mockRED, 'some url', mockEventEmitter);
                expect(mockEventEmitter.removeAllListeners).to.have.been.calledOnceWithExactly();
            });
        });
    });
});
