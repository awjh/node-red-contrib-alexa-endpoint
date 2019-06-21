import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import {AlexaListener} from './alexa-listener';
import * as util from 'util';

const expect = chai.expect;
chai.use(sinonChai);

describe('#alexa-listener', () => {

    let sandbox: sinon.SinonSandbox;

    const mockRED = {
        nodes: {
            createNode: sinon.stub(),
            registerType: sinon.stub()
        }
    }

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    it ('should get loaded', async () => {
        console.log(AlexaListener(mockRED));
    });
});