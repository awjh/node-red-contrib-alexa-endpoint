import * as chai from 'chai';
import * as mockery from 'mockery';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { noCacheRequire } from './test-helpers/test-helpers';
import { IAlexaSpeakerConfig } from './utils/nodes/alexa-speaker';

const expect = chai.expect;
chai.use(sinonChai);

describe ('#AlexaSpeaker', () => {
    let AlexaSpeaker;

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

        AlexaSpeaker = noCacheRequire('./alexa-speaker');
    });

    afterEach(() => {
        mockery.deregisterAll();
    });

    after(() => {
        mockery.disable();
    });

    it ('should register the type', async () => {
        (AlexaSpeaker as any)(mockRED);

        expect(registerStub).to.have.been.calledOnceWithExactly(mockRED, 'alexa-speaker', sinon.match.func);
    });

    describe ('Node', () => {
        const mockNode = {
            setupNode: sinon.stub(),
        };

        const MockNodeAlexaSpeaker = {
            AlexaSpeakerNode: sinon.stub().returns(mockNode),
        };

        beforeEach(() => {
            mockery.registerMock('./utils/nodes/alexa-speaker', MockNodeAlexaSpeaker);
            AlexaSpeaker = noCacheRequire('./alexa-speaker');
        });

        describe ('constructor', () => {
            it ('should call setup on its extended node', () => {
                (AlexaSpeaker as any)(mockRED);

                const Node = registerStub.getCall(0).args[2];

                const mockConfig: IAlexaSpeakerConfig = {
                    id: 'some id',
                    message: 'some message',
                    name: 'some name',
                    type: 'some type',
                };

                Node(mockConfig);

                expect(MockNodeAlexaSpeaker.AlexaSpeakerNode).to.have.been.calledOnceWithExactly(mockRED, mockConfig);
                expect(mockNode.setupNode).to.have.been.calledOnceWithExactly();
            });
        });
    });
});
