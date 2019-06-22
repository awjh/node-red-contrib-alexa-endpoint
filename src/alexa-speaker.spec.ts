import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as AlexaSpeaker from './alexa-speaker';
import { EventEmitter } from './utils/event-emitter';

const expect = chai.expect;
chai.use(sinonChai);

describe ('#alexa-speaker', () => {

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
        (AlexaSpeaker as any)(mockRED);

        expect(mockRED.nodes.registerType).to.have.been.calledOnceWithExactly('alexa-speaker', sinon.match.func);
    });

    describe ('AlexaListenerNode', () => {
        let AlexaSpeakerNode;

        let mockConfig: AlexaSpeaker.IAlexaSpeakerConfig;

        let mockEventEmitter: sinon.SinonStubbedInstance<EventEmitter>;

        beforeEach(() => {
            (AlexaSpeaker as any)(mockRED);

            AlexaSpeakerNode = mockRED.nodes.registerType.getCall(0).args[1];

            mockEventEmitter = sandbox.createStubInstance(EventEmitter);

            mockConfig = {
                id: 'some type',
                message: 'some message',
                name: 'some name',
                type: 'some type',
            };
        });

        it ('should assign values when constructed, create node and listen', () => {
            mockRED.nodes.createNode.callsFake((node) => {
                node.on = sinon.stub();
            });

            const alexaListenerNode = new AlexaSpeakerNode(mockConfig);

            expect(alexaListenerNode.name).to.deep.equal('some name');
            expect(alexaListenerNode.message).to.deep.equal('some message');

            expect(mockRED.nodes.createNode).to.have.been.calledOnceWithExactly(alexaListenerNode, mockConfig);
            expect(alexaListenerNode.on).to.have.been.calledOnceWithExactly('input', sinon.match.func);
        });
    });
});
