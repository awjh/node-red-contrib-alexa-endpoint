import * as chai from 'chai';
import * as mockery from 'mockery';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { noCacheRequire } from './test/helpers/test-helpers';
import { IAlexaListenerConfig } from './utils/nodes/alexa-listener';

const expect = chai.expect;
chai.use(sinonChai);

describe ('#AlexaListener', () => {
    let AlexaListener;

    let mockRED: {
        nodes: {
            createNode: sinon.SinonStub;
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

        AlexaListener = noCacheRequire('./alexa-listener');
    });

    afterEach(() => {
        mockery.deregisterAll();
    });

    after(() => {
        mockery.disable();
    });

    it ('should register the type', () => {
        (AlexaListener as any)(mockRED);

        expect(registerStub).to.have.been.calledOnceWithExactly(mockRED, 'alexa-listener', sinon.match.func);
    });

    describe ('Node', () => {

        const mockNode = {
            setupNode: sinon.stub(),
        };

        const MockNodeAlexaListener = {
            AlexaListenerNode: sinon.stub().returns(mockNode),
        };

        beforeEach(() => {
            mockery.registerMock('./utils/nodes/alexa-listener', MockNodeAlexaListener);
            AlexaListener = noCacheRequire('./alexa-listener');
        });

        describe ('constructor', () => {
            it ('should call setup on its extended node', () => {
                (AlexaListener as any)(mockRED);

                const Node = registerStub.getCall(0).args[2];

                const mockConfig: IAlexaListenerConfig = {
                    id: 'some id',
                    intents: ['some', 'intents'],
                    name: 'some name',
                    type: 'some type',
                    url: 'some url',
                };

                Node(mockConfig);

                expect(MockNodeAlexaListener.AlexaListenerNode).to.have.been.calledOnceWithExactly(mockRED, mockConfig);
                expect(mockNode.setupNode).to.have.been.calledOnceWithExactly();
            });
        });
    });
});
