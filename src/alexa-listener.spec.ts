import * as chai from 'chai';
import * as mockery from 'mockery';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { noCacheRequire } from './test-helpers/test-helpers';
import { IAlexaListenerConfig } from './utils/nodes/alexa-listener';

const expect = chai.expect;
chai.use(sinonChai);

describe ('#AlexaListener', () => {
    let AlexaListener;

    let mockRED: {
        nodes: {
            createNode: sinon.SinonStub;
            registerType: sinon.SinonStub;
        },
    };

    before(() => {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
        });
    });

    beforeEach(() => {
        AlexaListener = noCacheRequire('./alexa-listener');

        mockRED = {
            nodes: {
                createNode: sinon.stub(),
                registerType: sinon.stub(),
            },
        };
    });

    afterEach(() => {
        mockery.deregisterAll();
    });

    after(() => {
        mockery.disable();
    });

    it ('should register the type', async () => {
        (AlexaListener as any)(mockRED);

        expect(mockRED.nodes.registerType).to.have.been.calledOnceWithExactly('alexa-listener', sinon.match.func);
    });

    describe ('node factory', () => {
        it ('should create a new AlexaSpeakerNode', () => {
            const mockConfig: IAlexaListenerConfig = {
                id: 'some id',
                intents: ['some', 'intents'],
                name: 'some name',
                type: 'some type',
                url: 'some url',
            };

            const mockNode = {
                setupNode: sinon.stub(),
            };

            const MockNodeAlexaListener = {
                AlexaListenerNode: sinon.stub().returns(mockNode),
            };

            mockery.registerMock('./utils/nodes/alexa-listener', MockNodeAlexaListener);
            AlexaListener = noCacheRequire('./alexa-listener');

            (AlexaListener as any)(mockRED);

            const nodeFactory = mockRED.nodes.registerType.getCall(0).args[1];

            nodeFactory(mockConfig);
            expect(MockNodeAlexaListener.AlexaListenerNode).to.have.been.calledOnceWithExactly(mockRED, mockConfig);
            expect(mockNode.setupNode).to.have.been.calledOnceWithExactly();
        });
    });
});
