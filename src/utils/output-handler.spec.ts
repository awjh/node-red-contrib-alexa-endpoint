import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import { OutputHandler } from './output-handler';

const expect = chai.expect;
chai.use(sinonChai);

describe ('#OutputHandler', () => {
    describe ('selectOutputFromArray', () => {
        it ('should return null for all in array when value not found', () => {
            const output = OutputHandler.selectOutputFromArray(['some', 'values'], 'other', 'some message');

            expect(output).to.deep.equal([null, null]);
        });

        it ('should return null for all in array but position where value found', () => {
            const output = OutputHandler.selectOutputFromArray(['some', 'values'], 'values', 'some message');

            expect(output).to.deep.equal([null, 'some message']);
        });
    });
});
