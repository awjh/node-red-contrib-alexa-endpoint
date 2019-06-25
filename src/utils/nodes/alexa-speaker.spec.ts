import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { AlexaHandler } from '../alexa-handler';
import { AlexaSpeakerNode, IAlexaSpeaker, IAlexaSpeakerConfig } from './alexa-speaker';

const expect = chai.expect;
chai.use(sinonChai);

describe ('#AlexaSpeakerNode', () => {
    let sandbox: sinon.SinonSandbox;

    let mockRED: {
        nodes: {
            createNode: sinon.SinonStub,
            registerType: sinon.SinonStub,
        },
    };

    let mockConfig: IAlexaSpeakerConfig;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        mockRED = {
            nodes: {
                createNode: sinon.stub(),
                registerType: sinon.stub(),
            },
        };

        mockConfig = {
            id: 'some type',
            message: 'some message',
            name: 'some name',
            type: 'some type',
        };
    });

    describe ('constructor', () => {
        it ('should assign values when constructed, create node and listen', () => {
            const alexaSpeakerNode = new AlexaSpeakerNode(mockRED as any, mockConfig);

            expect(alexaSpeakerNode.name).to.deep.equal('some name');
            expect(alexaSpeakerNode.message).to.deep.equal('some message');
            expect(alexaSpeakerNode.RED).to.deep.equal(mockRED);
        });
    });

    describe ('setupNode', () => {
        mockRED.nodes.createNode.callsFake((node) => {
            node.on = sinon.stub();
        });

        const alexaSpeakerNode = new AlexaSpeakerNode(mockRED as any, mockConfig) as any as IAlexaSpeaker;

        alexaSpeakerNode.setupNode();

        expect(mockRED.nodes.createNode).to.have.been.calledOnceWithExactly(alexaSpeakerNode, mockConfig);
        expect(alexaSpeakerNode.on).to.have.been.calledOnceWithExactly(
            'input', (alexaSpeakerNode as any).inputHandler,
        );
    });

    describe ('inputHandler', () => {
        it ('should send a speak request', () => {
            mockRED.nodes.createNode.callsFake((node) => {
                node.on = sinon.stub();
            });

            const speakStub = sandbox.stub(AlexaHandler, 'speak');

            const alexaSpeakerNode = new AlexaSpeakerNode(mockRED as any, mockConfig);

            const mockMsg = 'some message';

            (alexaSpeakerNode as any).inputHandler(mockMsg);

            expect(speakStub).to.have.been.calledOnceWithExactly('some message', mockMsg);
        });
    });
});
