import * as chai from 'chai';
import * as mockery from 'mockery';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { noCacheRequire } from './test-helpers/test-helpers';
import { IAlexaSpeakerListenerConfig } from './utils/nodes/alexa-speaker-listener';

const expect = chai.expect;
chai.use(sinonChai);

describe ('#AlexaSpeakerListener', () => {
    let AlexaSpeakerListener;

    let mockRED: {
        nodes: {
            createNode: sinon.SinonStub,
        },
    };

    let registerStub: sinon.SinonStub;

    before(() => {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
        });
    });

    beforeEach(() => {
        mockRED = {
            nodes: {
                createNode: sinon.stub(),
            },
        };

        registerStub = sinon.stub();
        mockery.registerMock('./utils/node-red', {registerType: registerStub});

        AlexaSpeakerListener = noCacheRequire('./alexa-speaker-listener');
    });

    afterEach(() => {
        mockery.deregisterAll();
    });

    after(() => {
        mockery.disable();
    });

    it ('should register the type', async () => {
        (AlexaSpeakerListener as any)(mockRED);

        expect(registerStub).to.have.been.calledOnceWithExactly(
            mockRED, 'alexa-speaker-listener', sinon.match.func,
        );
    });

    describe ('Node', () => {
        const mockNode = {
            setupNode: sinon.stub(),
        };

        const MockNodeAlexaSpeakerListener = {
            AlexaSpeakerListenerNode: sinon.stub().returns(mockNode),
        };

        beforeEach(() => {
            mockery.registerMock('./utils/nodes/alexa-speaker-listener', MockNodeAlexaSpeakerListener);
            AlexaSpeakerListener = noCacheRequire('./alexa-speaker-listener');
        });

        describe ('constructor', () => {
            it ('should call setup on its extended node', () => {
                (AlexaSpeakerListener as any)(mockRED);

                const Node = registerStub.getCall(0).args[2];

                const mockConfig: IAlexaSpeakerListenerConfig = {
                    id: 'some id',
                    intents: ['some', 'intents'],
                    message: 'some message',
                    name: 'some name',
                    type: 'some type',
                    url: 'some url',
                };

                Node(mockConfig);

                expect(MockNodeAlexaSpeakerListener.AlexaSpeakerListenerNode).to.have.been.calledOnceWithExactly(
                    mockRED, mockConfig,
                );
                expect(mockNode.setupNode).to.have.been.calledOnceWithExactly();
            });
        });
    });
});
