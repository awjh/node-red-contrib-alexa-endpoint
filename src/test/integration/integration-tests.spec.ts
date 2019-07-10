import * as chai from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as request from 'request';

// tslint:disable: max-line-length

const expect = chai.expect;

const requestAsync = (options) => {
    return new Promise((resolve, reject) => {
        request(options, (error, resp, body) => {
            if (error) {
                reject(error);
            }

            resolve(body);
        });
    });
};

const testJSONFolder = path.join(__dirname, '../../../testing/integration');

describe('#IntegrationTests', () => {

    let expectedOutput: {
        response: {
            directives: string[],
            outputSpeech: { text: string, type: string },
            shouldEndSession: boolean,
            type: string,
        },
        sessionAttributes: {},
        version: string,
    };

    beforeEach(() => {
        expectedOutput = {
            response: {
                directives: [],
                outputSpeech: { text: 'some message', type: 'PlainText' },
                shouldEndSession: true,
                type: '_DEFAULT_RESPONSE',
            },
            sessionAttributes: {},
            version: '1.0',
        };
    });

    it('should respond to a intent and give a finishing response', async () => {
        const body = await requestAsync({
            json: JSON.parse(fs.readFileSync(path.join(testJSONFolder, 'intentone.json')).toString()),
            method: 'POST',
            url: 'http://localhost:1880',
        });

        expectedOutput.response.outputSpeech.text = 'some message';

        expect(body).to.deep.equal(expectedOutput);
    });

    it ('should respond to a intent and give a non finishing response until gets reply and respond with if of switch', async () => {
        const firstBody = await requestAsync({
            json: JSON.parse(fs.readFileSync(path.join(testJSONFolder, 'intenttwo.json')).toString()),
            method: 'POST',
            url: 'http://localhost:1880',
        });

        expectedOutput.response.outputSpeech.text = 'something to respond to';
        expectedOutput.response.shouldEndSession = false;

        expect(firstBody).to.deep.equal(expectedOutput);

        const secondBody = await requestAsync({
            json: JSON.parse(fs.readFileSync(path.join(testJSONFolder, 'intentthree_exit1.json')).toString()),
            method: 'POST',
            url: 'http://localhost:1880',
        });

        expectedOutput.response.outputSpeech.text = 'some other message';
        expectedOutput.response.shouldEndSession = true;

        expect(secondBody).to.deep.equal(expectedOutput);
    });

    it ('should respond to a intent and give a non finishing response until gets reply and respond with else of switch', async () => {
        const firstBody = await requestAsync({
            json: JSON.parse(fs.readFileSync(path.join(testJSONFolder, 'intenttwo.json')).toString()),
            method: 'POST',
            url: 'http://localhost:1880',
        });

        expectedOutput.response.outputSpeech.text = 'something to respond to';
        expectedOutput.response.shouldEndSession = false;

        expect(firstBody).to.deep.equal(expectedOutput);

        const secondBody = await requestAsync({
            json: JSON.parse(fs.readFileSync(path.join(testJSONFolder, 'intentthree_exit2.json')).toString()),
            method: 'POST',
            url: 'http://localhost:1880',
        });

        expectedOutput.response.outputSpeech.text = 'some further message';
        expectedOutput.response.shouldEndSession = true;

        expect(secondBody).to.deep.equal(expectedOutput);
    });

    // tslint:disable-next-line: no-empty
    it ('should respond to an intent and give non finishing response and handle when response of unexpected intent given', () => {});

    // tslint:disable-next-line: no-empty
    it ('should respond to the correct sessions with the correct response', () => {});

    // tslint:disable-next-line: no-empty
    it ('should handle replying to a response whilst another is waiting', () => {});
});
