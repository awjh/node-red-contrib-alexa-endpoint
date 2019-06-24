import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as AlexaListener from './alexa-listener';

const expect = chai.expect;
chai.use(sinonChai);

describe ('#AlexaListener', () => {

    let mockRED: {
        nodes: {
            createNode: sinon.SinonStub;
            registerType: sinon.SinonStub;
        },
    };

    beforeEach(() => {
        mockRED = {
            nodes: {
                createNode: sinon.stub(),
                registerType: sinon.stub(),
            },
        };
    });

    it ('should register the type', async () => {
        (AlexaListener as any)(mockRED);

        expect(mockRED.nodes.registerType).to.have.been.calledOnceWithExactly('alexa-listener', sinon.match.func);
    });

    // TODO MAKE THE TESTS USE MOCKERY AND TEST LIKE THE SPEAKER TESTS
});
