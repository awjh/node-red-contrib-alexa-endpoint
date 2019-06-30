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

            expect(alexaSpeakerNode.message).to.deep.equal('some message');
        });
    });

    describe ('setupNode', () => {
        it ('should setup the input listener', () => {
            const alexaSpeakerNode = new AlexaSpeakerNode(mockRED as any, mockConfig) as any as IAlexaSpeaker;

            const onStub = sinon.stub(alexaSpeakerNode, 'on');

            alexaSpeakerNode.setupNode();

            expect(mockRED.nodes.createNode).to.have.been.calledOnceWithExactly(alexaSpeakerNode, mockConfig);
            expect(onStub).to.have.been.calledOnceWithExactly(
                'input', sinon.match.func,
            );
        });

        describe ('input handler', () => {
            it ('should call inputHandler', () => {
                const mockMsg = {
                    some: 'message',
                };

                const alexaListenerNode = new AlexaSpeakerNode(mockRED as any, mockConfig);

                const onStub = sinon.stub(alexaListenerNode, 'on');

                const inputStub = sandbox.stub(alexaListenerNode, 'inputHandler');

                alexaListenerNode.setupNode();

                onStub.getCall(0).args[1](mockMsg);

                expect(inputStub).to.have.been.calledOnceWithExactly(mockMsg);
            });
        });
    });

    describe ('inputHandler', () => {
        it ('should send a speak request', () => {
            const speakStub = sandbox.stub(AlexaHandler, 'speak');

            const alexaSpeakerNode = new AlexaSpeakerNode(mockRED as any, mockConfig);

            const mockMsg = 'some message';

            (alexaSpeakerNode as any).inputHandler(mockMsg);

            expect(speakStub).to.have.been.calledOnceWithExactly('some message', mockMsg);
        });
    });
});
