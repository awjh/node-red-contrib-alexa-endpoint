import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as fs from 'fs';
import * as path from 'path';
import * as request from 'request';

// tslint:disable: max-line-length

chai.use(chaiAsPromised);
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

const alexaRequest = async (intent: any) => {
    return requestAsync({
        json: intent,
        method: 'POST',
        timeout: 5000,
        url: 'http://localhost:1880',
    });
};

const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

    const rawIntentOne = fs.readFileSync(path.join(testJSONFolder, 'intentone.json')).toString();
    const rawIntentTwo = fs.readFileSync(path.join(testJSONFolder, 'intenttwo.json')).toString();
    const rawIntentThreeExit1 = fs.readFileSync(path.join(testJSONFolder, 'intentthree_exit1.json')).toString();
    const rawIntentThreeExit2 = fs.readFileSync(path.join(testJSONFolder, 'intentthree_exit2.json')).toString();

    let intentOne;
    let intentTwo;
    let intentThreeExit1;
    let intentThreeExit2;

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

        intentOne = JSON.parse(rawIntentOne);
        intentTwo = JSON.parse(rawIntentTwo);
        intentThreeExit1 = JSON.parse(rawIntentThreeExit1);
        intentThreeExit2 = JSON.parse(rawIntentThreeExit2);
    });

    it('should respond to a intent and give a finishing response', async () => {
        const body = await alexaRequest(intentOne);

        expectedOutput.response.outputSpeech.text = 'some message';

        expect(body).to.deep.equal(expectedOutput);
    });

    it ('should respond to a intent and give a non finishing response until gets reply and respond with if of switch', async () => {
        const firstBody = await alexaRequest(intentTwo);

        expectedOutput.response.outputSpeech.text = 'something to respond to';
        expectedOutput.response.shouldEndSession = false;

        expect(firstBody).to.deep.equal(expectedOutput);

        const secondBody = await alexaRequest(intentThreeExit1);

        expectedOutput.response.outputSpeech.text = 'some other message';
        expectedOutput.response.shouldEndSession = true;

        expect(secondBody).to.deep.equal(expectedOutput);
    });

    it ('should respond to a intent and give a non finishing response until gets reply and respond with else of switch', async () => {
        const firstBody = await alexaRequest(intentTwo);

        expectedOutput.response.outputSpeech.text = 'something to respond to';
        expectedOutput.response.shouldEndSession = false;

        expect(firstBody).to.deep.equal(expectedOutput);

        const secondBody = await alexaRequest(intentThreeExit2);

        expectedOutput.response.outputSpeech.text = 'some further message';
        expectedOutput.response.shouldEndSession = true;

        expect(secondBody).to.deep.equal(expectedOutput);
    });

    it ('should respond to an intent and give non finishing response and handle when response of unexpected intent given', async () => {
        const firstBody = await alexaRequest(intentTwo);

        expectedOutput.response.outputSpeech.text = 'something to respond to';
        expectedOutput.response.shouldEndSession = false;

        expect(firstBody).to.deep.equal(expectedOutput);

        intentOne.session.new = false;
        intentOne.session.sessionId = intentTwo.session.sessionId;

        const secondBody = await alexaRequest(intentOne);

        expectedOutput.response.outputSpeech.text = 'Sorry I don\'t understand your response in this context. Please try again.';
        expectedOutput.response.shouldEndSession = false;

        expect(secondBody).to.deep.equal(expectedOutput);

        const thirdBody = await alexaRequest(intentThreeExit1);

        expectedOutput.response.outputSpeech.text = 'some other message';
        expectedOutput.response.shouldEndSession = true;

        expect(thirdBody).to.deep.equal(expectedOutput);
    });

    it ('should handle replying to a response whilst another is waiting', async () => {
        const firstBody = await alexaRequest(intentTwo);

        expectedOutput.response.outputSpeech.text = 'something to respond to';
        expectedOutput.response.shouldEndSession = false;

        expect(firstBody).to.deep.equal(expectedOutput);

        const secondBody = await alexaRequest(intentOne);

        expectedOutput.response.outputSpeech.text = 'some message';
        expectedOutput.response.shouldEndSession = true;

        expect(secondBody).to.deep.equal(expectedOutput);

        const thirdBody = await alexaRequest(intentThreeExit1);

        expectedOutput.response.outputSpeech.text = 'some other message';
        expectedOutput.response.shouldEndSession = true;

        expect(thirdBody).to.deep.equal(expectedOutput);
    });

    it ('should clear sessions after timeout', async () => {
        const firstBody = await alexaRequest(intentTwo);

        expectedOutput.response.outputSpeech.text = 'something to respond to';
        expectedOutput.response.shouldEndSession = false;

        expect(firstBody).to.deep.equal(expectedOutput);

        await sleep(31000);

        // tslint:disable-next-line: no-unused-expression
        await expect(alexaRequest(intentThreeExit2)).to.eventually.be.rejected;
    }).timeout(0);

    it ('should refresh session timeout after bad response', async () => {
        const firstBody = await alexaRequest(intentTwo);

        expectedOutput.response.outputSpeech.text = 'something to respond to';
        expectedOutput.response.shouldEndSession = false;

        expect(firstBody).to.deep.equal(expectedOutput);

        intentOne.session.new = false;
        intentOne.session.sessionId = intentTwo.session.sessionId;

        await sleep(20000);
        const secondBody = await alexaRequest(intentOne);

        expectedOutput.response.outputSpeech.text = 'Sorry I don\'t understand your response in this context. Please try again.';
        expectedOutput.response.shouldEndSession = false;

        expect(secondBody).to.deep.equal(expectedOutput);

        await sleep(20000);

        const thirdBody = await alexaRequest(intentThreeExit1);

        expectedOutput.response.outputSpeech.text = 'some other message';
        expectedOutput.response.shouldEndSession = true;

        expect(thirdBody).to.deep.equal(expectedOutput);
    }).timeout(0);
});
