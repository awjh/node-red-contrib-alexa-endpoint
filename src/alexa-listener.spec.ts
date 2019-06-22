import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as AlexaListener from './alexa-listener';
import { AlexaHandler } from './utils/alexa-handler';
import { EventEmitter } from './utils/event-emitter';

const expect = chai.expect;
chai.use(sinonChai);

describe('#alexa-listener', () => {

    let sandbox: sinon.SinonSandbox;

    let mockRED: {
        nodes: {
            createNode: sinon.SinonStub;
            registerType: sinon.SinonStub;
        }
    };

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        mockRED = {
            nodes: {
                createNode: sinon.stub(),
                registerType: sinon.stub()
            }
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    it ('should register the type', async () => {
        (AlexaListener as any)(mockRED);

        expect(mockRED.nodes.registerType).to.have.been.calledOnceWithExactly('alexa-listener', sinon.match.func);
    });

    describe('AlexaListenerNode', () => {
        let AlexaListenerNode;

        const mockConfig: AlexaListener.IAlexaListenerConfig = {
            id: 'some type',
            intents: ['some', 'intents'],
            name: 'some name',
            type: 'some type',
            url: 'some url'
        };
        
        let alexaHandlerListenStub: sinon.SinonStub;

        let mockEventEmitter: sinon.SinonStubbedInstance<EventEmitter>;

        beforeEach(() => {
            (AlexaListener as any)(mockRED);

            AlexaListenerNode = mockRED.nodes.registerType.getCall(0).args[1];

            mockEventEmitter = sandbox.createStubInstance(EventEmitter);

            alexaHandlerListenStub = sandbox.stub(AlexaHandler, 'listen').returns(mockEventEmitter);
        });

        it ('should assign values when constructed, create node and listen', () => {
            mockRED.nodes.createNode.callsFake((node) => {
                node.on = sinon.stub();
            });
            
            const alexaListenerNode = new AlexaListenerNode(mockConfig);

            alexaListenerNode.name = 'some name';
            alexaListenerNode.url = 'some url';
            alexaListenerNode.intents = ['some intents'];

            expect(mockRED.nodes.createNode).to.have.been.calledOnceWithExactly(alexaListenerNode, mockConfig);
            expect(alexaHandlerListenStub).to.have.been.calledOnceWithExactly(mockRED, 'some url');
            expect(mockEventEmitter.on).to.have.been.calledOnceWithExactly('INTENT_REQUEST', sinon.match.func);
            expect(alexaListenerNode.on).to.have.been.calledOnceWithExactly('close', sinon.match.func);
        });

        it ('should handle no intent passed in config');

        it ('should handle when event emitter called with intent request');

        it ('should handle node close event');
    });
});