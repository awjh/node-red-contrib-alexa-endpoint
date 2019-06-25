import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { AlexaHandler } from '../alexa-handler';
import { EventEmitter } from '../event-emitter';
import { OutputHandler } from '../output-handler';
import { AlexaListenerNode, IAlexaListenerConfig } from './alexa-listener';

const expect = chai.expect;
chai.use(sinonChai);

// tslint:disable: no-unused-expression
describe ('AlexaListenerNode', () => {

    let sandbox: sinon.SinonSandbox;

    let mockConfig: IAlexaListenerConfig;

    let alexaHandlerListenStub: sinon.SinonStub;

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

        alexaHandlerListenStub = sandbox.stub(AlexaHandler, 'listen').returns(mockEventEmitter);

        mockConfig = {
            id: 'some type',
            intents: ['some', 'intents'],
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
        it ('should assign values when constructed, create node and listen', () => {
            mockRED.nodes.createNode.callsFake((node) => {
                node.on = sinon.stub();
            });

            const alexaListenerNode = new AlexaListenerNode(mockRED as any, mockConfig);

            expect((alexaListenerNode as any).name).to.deep.equal('some name');
            expect((alexaListenerNode as any).url).to.deep.equal('some url');
            expect((alexaListenerNode as any).intents).to.deep.equal(['some', 'intents']);

            expect(mockRED.nodes.createNode).to.have.been.calledOnceWithExactly(alexaListenerNode, mockConfig);
            expect(alexaHandlerListenStub).to.have.been.calledOnceWithExactly(mockRED, 'some url');
            expect(mockEventEmitter.on).to.have.been.calledOnceWithExactly(
                'INTENT_REQUEST', (alexaListenerNode as any).intentHandler,
            );
            expect((alexaListenerNode as any).on).to.have.been.calledOnceWithExactly(
                'close', (alexaListenerNode as any).closeHandler,
            );
        });

        it ('should handle no intent passed in config', () => {
            mockRED.nodes.createNode.callsFake((node) => {
                node.on = sinon.stub();
            });

            delete mockConfig.intents;

            const alexaListenerNode = new AlexaListenerNode(mockRED as any, mockConfig);

            expect(alexaListenerNode.name).to.deep.equal('some name');
            expect(alexaListenerNode.url).to.deep.equal('some url');
            expect(alexaListenerNode.intents).to.deep.equal([]);
            expect(alexaListenerNode.RED).to.deep.equal(mockRED);
        });
    });

    describe ('setupNode', () => {
        const alexaListenerNode = new AlexaListenerNode(mockRED as any, mockConfig);

        alexaListenerNode.setupNode();

        expect(mockRED.nodes.createNode).to.have.been.calledOnceWithExactly(alexaListenerNode, mockConfig);
        expect(alexaHandlerListenStub).to.have.been.calledOnceWithExactly(mockRED, 'some url');
        expect(mockEventEmitter.on).to.have.been.calledOnceWithExactly(
            'INTENT_REQUEST', (alexaListenerNode as any).intentHandler,
        );
        expect((alexaListenerNode as any).on).to.have.been.calledOnceWithExactly(
            'close', (alexaListenerNode as any).closeHandler,
        );
    });

    describe ('intentHandler', () => {
        it ('should call send when new session', () => {
            mockRED.nodes.createNode.callsFake((node) => {
                node.on = sinon.stub();
                node.send = sinon.stub();
            });

            const selectOutputStub = sandbox.stub(OutputHandler, 'selectOutputFromArray').returns(['some output']);

            const alexaListenerNode = new AlexaListenerNode(mockRED as any, mockConfig);

            const fakeMessage = {
                payload: {
                    intent: 'intent',
                    session: {
                        new: true,
                    },
                },
            };

            (alexaListenerNode as any).intentHandler(fakeMessage);

            expect(selectOutputStub).to.have.been.calledOnceWithExactly(['some', 'intents'], 'intent', fakeMessage);
            expect((alexaListenerNode as any).send).to.have.been.calledOnceWithExactly(['some output']);
        });

        it ('should do nothing when not a new session', () => {
            mockRED.nodes.createNode.callsFake((node) => {
                node.on = sinon.stub();
                node.send = sinon.stub();
            });

            const selectOutputStub = sandbox.stub(OutputHandler, 'selectOutputFromArray').returns(['some output']);

            const alexaListenerNode = new AlexaListenerNode(mockRED as any, mockConfig);

            const fakeMessage = {
                payload: {
                    intent: 'intent',
                    session: {
                        new: false,
                    },
                },
            };

            (alexaListenerNode as any).intentHandler(fakeMessage);

            expect(selectOutputStub).to.not.have.been.called;
            expect((alexaListenerNode as any).send).to.not.have.been.called;
        });
    });

    describe ('closeHandler', () => {
        it ('should close listeners', () => {
            mockRED.nodes.createNode.callsFake((node) => {
                node.on = sinon.stub();
            });

            const unlistenStub = sandbox.stub(AlexaHandler, 'unlisten');

            const alexaListenerNode = new AlexaListenerNode(mockRED as any, mockConfig);

            (alexaListenerNode as any).closeHandler();

            expect(unlistenStub).to.have.been.calledOnceWithExactly(mockRED, 'some url', mockEventEmitter);
            expect(mockEventEmitter.removeAllListeners).to.have.been.calledOnceWithExactly();
        });
    });
});
