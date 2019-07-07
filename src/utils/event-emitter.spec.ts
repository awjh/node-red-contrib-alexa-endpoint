import * as chai from 'chai';
import * as mockery from 'mockery';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { noCacheRequire } from '../test/helpers/test-helpers';

const expect = chai.expect;
chai.use(sinonChai);

describe ('#EventEmitter', () => {
    let EventEmitter;
    let uuidStub: sinon.SinonStub;

    before(() => {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
        });
    });

    beforeEach(() => {
        uuidStub = sinon.stub().returns('some id');
        mockery.registerMock('uuid/v4', uuidStub);

        EventEmitter = noCacheRequire('./utils/event-emitter').EventEmitter;
    });

    afterEach(() => {
        mockery.deregisterAll();
    });

    after(() => {
        mockery.disable();
    });

    describe ('construtor', () => {
        it ('should set the ID using UUID', () => {
            const ee = new EventEmitter();

            expect(uuidStub).to.have.been.calledOnceWithExactly();
            expect(ee.id).to.deep.equal('some id');
        });
    });
});
