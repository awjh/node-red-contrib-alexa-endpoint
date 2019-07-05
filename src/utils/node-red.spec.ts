import * as chai from 'chai';
import * as sinon from 'sinon';
import { registerType } from './node-red';

const expect = chai.expect;

describe ('#registerType', () => {
    let mockRED: {
        nodes: {
            registerType: sinon.SinonStub,
        },
    };

    class MockClass {}

    beforeEach(() => {
        mockRED = {
            nodes: {
                registerType: sinon.stub(),
            },
        };
    });

    it ('should call registerType', () => {
        const spy = sinon.spy(sinon, 'stub');

        registerType(mockRED as any, 'some type', MockClass);

        expect(spy).to.have.been.calledOnceWithExactly(Object, 'setPrototypeOf');
        expect(mockRED.nodes.registerType).to.have.been.calledOnceWithExactly('some type', MockClass);
    });
});
