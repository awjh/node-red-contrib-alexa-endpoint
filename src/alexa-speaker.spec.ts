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
            registerType: sinon.SinonStub,
        },
    };

    before(() => {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
        });
    });

    beforeEach(() => {
        AlexaSpeaker = noCacheRequire('./alexa-speaker');

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
        (AlexaSpeaker as any)(mockRED);

        expect(mockRED.nodes.registerType).to.have.been.calledOnceWithExactly('alexa-speaker', sinon.match.func);
    });

    describe ('node factory', () => {
        it ('should create a new AlexaSpeakerNode', () => {
            const mockConfig: IAlexaSpeakerConfig = {
                id: 'some id',
                message: 'some message',
                name: 'some name',
                type: 'some type',
            };

            const MockNodeAlexaSpeaker = {
                AlexaSpeakerNode: sinon.stub(),
            };

            mockery.registerMock('./utils/nodes/alexa-speaker', MockNodeAlexaSpeaker);
            AlexaSpeaker = noCacheRequire('./alexa-speaker');

            (AlexaSpeaker as any)(mockRED);

            const nodeFactory = mockRED.nodes.registerType.getCall(0).args[1];

            nodeFactory(mockConfig);
            expect(MockNodeAlexaSpeaker.AlexaSpeakerNode).to.have.been.calledOnceWithExactly(mockRED, mockConfig);
        });
    });
});
