import * as fs from 'fs';
import * as path from 'path';
import * as request from 'request';

// tslint:disable: max-line-length

describe ('#IntegrationTests', () => {
    it ('should respond to a intent and give a finishing response', () => {
        console.log('HELLO', path.join(__dirname, '../../testing/integration/intentone.json'));
        request({
            json: fs.readFileSync(path.join(__dirname, '../../testing/integration/intentone.json')),
            method: 'POST',
            url: 'localhost:1880',
        }, (error, resp, body) => {
            console.log(body);
        });
    });
});
