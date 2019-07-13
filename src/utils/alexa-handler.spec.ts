import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { AlexaHandler } from './alexa-handler';
import { EventEmitter } from './event-emitter';

const expect = chai.expect;
chai.use(sinonChai);

describe ('#AlexaHandler', () => {
    describe ('listen', () => {

        let postStub: sinon.SinonStub;
        let mockRED: any;

        beforeEach(() => {
            postStub = sinon.stub();

            mockRED = {
                httpNode: {
                    _router: {
                        stack: [{
                            route: {
                                methods: {
                                    post: true,
                                },
                                path: '/some/url',
                            },
                        }],
                    },
                    post: postStub,
                },
            };
        });

        it ('should add to list of existing event emitters for a given URL', () => {
            const ee = new EventEmitter();
            (AlexaHandler as any).eventEmitters = {
                '/some/url': [ee],
            };

            AlexaHandler.listen(mockRED, '/some/url');

            // tslint:disable-next-line: no-unused-expression
            expect(postStub).to.not.have.been.called;
            expect((AlexaHandler as any).eventEmitters['/some/url'].length).to.deep.equal(2);
        });

        it ('should create a new array of event emitters when none found for url', () => {
            const ee = new EventEmitter();
            (AlexaHandler as any).eventEmitters = {
                '/some/other/url': [ee],
            };

            AlexaHandler.listen(mockRED, '/some/url');

            // tslint:disable-next-line: no-unused-expression
            expect(postStub).to.not.have.been.called;
            expect((AlexaHandler as any).eventEmitters['/some/url'].length).to.deep.equal(1);
            expect((AlexaHandler as any).eventEmitters['/some/other/url'].length).to.deep.equal(1);
        });

        it ('should setup http listener when url does not have listener', () => {
            delete mockRED.httpNode._router;

            const ee = new EventEmitter();
            (AlexaHandler as any).eventEmitters = {
                '/some/url': [ee],
            };

            AlexaHandler.listen(mockRED, '/some/url');

            expect(postStub.callCount).to.deep.equal(1);
            expect(postStub.getCall(0).args[0]).to.deep.equal('/some/url');
            expect((AlexaHandler as any).eventEmitters['/some/url'].length).to.deep.equal(2);
        });

        describe ('calllback', () => {
            let ee;
            let ee2;
            let ee3;

            let req;

            const res = {
                some: 'res',
            };

            let callback;
            let ee4: EventEmitter;

            beforeEach(() => {
                delete mockRED.httpNode._router;

                ee = new EventEmitter();
                ee.emit = sinon.stub();

                ee2 = new EventEmitter();
                ee2.emit = sinon.stub().callsFake((str, msg) => {
                    msg.actioned = true;
                });

                ee3 = new EventEmitter();
                ee3.emit = sinon.stub();

                (AlexaHandler as any).eventEmitters = {
                    '/some/other/url': [ee3],
                    '/some/url': [ee, ee2],
                };

                req = {
                    body: {
                        request: {
                            intent: {
                                name: 'some intent',
                                slots: {
                                    some: {
                                        value: 'slot',
                                    },
                                },
                            },
                            type: 'IntentRequest',
                        },
                    },
                };

                ee4 = AlexaHandler.listen(mockRED, '/some/url');
                ee4.emit = sinon.stub();

                callback = postStub.getCall(0).args[postStub.getCall(0).args.length - 2];
            });

            it ('should call emit on the event listeners until message is actioned', () => {
                callback(req, res);

                const expectedMessage: any = {
                    actioned: true,
                    payload: JSON.parse(JSON.stringify(req.body)),
                    req,
                    res,
                };
                expectedMessage.payload.intent = 'some intent';
                expectedMessage.payload.slots = {some: 'slot'};

                expect(ee.emit).to.have.been.calledOnceWithExactly('INTENT_REQUEST', expectedMessage);
                expect(ee2.emit).to.have.been.calledOnceWithExactly('INTENT_REQUEST', expectedMessage);
                // tslint:disable-next-line: no-unused-expression
                expect(ee3.emit).to.have.not.been.called;
                // tslint:disable-next-line: no-unused-expression
                expect(ee4.emit).to.have.not.been.called;
            });

            it ('should not call emit when not an intent request', () => {
                req.body.request.type = 'not IntentRequest';

                callback(req, res);

                // tslint:disable-next-line: no-unused-expression
                expect(ee.emit).to.have.not.been.called;
                // tslint:disable-next-line: no-unused-expression
                expect(ee2.emit).to.have.not.been.called;
                // tslint:disable-next-line: no-unused-expression
                expect(ee3.emit).to.have.not.been.called;
                // tslint:disable-next-line: no-unused-expression
                expect(ee4.emit).to.have.not.been.called;
            });

            it ('should handle when slot not set', () => {
                delete req.body.request.intent.slots;

                callback(req, res);

                const expectedMessage: any = {
                    actioned: true,
                    payload: JSON.parse(JSON.stringify(req.body)),
                    req,
                    res,
                };
                expectedMessage.payload.intent = 'some intent';

                expect(ee.emit).to.have.been.calledOnceWithExactly('INTENT_REQUEST', expectedMessage);
                expect(ee2.emit).to.have.been.calledOnceWithExactly('INTENT_REQUEST', expectedMessage);
                // tslint:disable-next-line: no-unused-expression
                expect(ee3.emit).to.have.not.been.called;
                // tslint:disable-next-line: no-unused-expression
                expect(ee4.emit).to.have.not.been.called;
            });
        });

        describe ('errorHandler', () => {
            it ('should send back an error', () => {
                delete mockRED.httpNode._router;

                AlexaHandler.listen(mockRED, '/some/url');

                const errorHandler = postStub.getCall(0).args[postStub.getCall(0).args.length - 1];

                const res = {
                    send: sinon.stub(),
                    status: sinon.stub(),
                };

                errorHandler(Error('some error'), {}, res, null);

                expect(res.status).to.have.been.calledOnceWithExactly(500);
                expect(res.send).to.have.been.calledOnceWithExactly('Error receiving post. some error');
            });
        });

        describe ('reqResNext', () => {
            it ('should call next on all functions that use reqResNext', () => {
                delete mockRED.httpNode._router;

                AlexaHandler.listen(mockRED, '/some/url');

                for (let i = 2; i < postStub.getCall(0).args.length - 2; i++) {
                    if (i === 5 || i === 6) {
                        // do nothing
                    } else {
                        const reqResNext = postStub.getCall(0).args[i];

                        const next = sinon.stub();

                        reqResNext({}, {}, next);

                        expect(next).to.have.been.calledOnceWithExactly();
                    }
                }
            });
        });
    });

    describe ('unlisten', () => {
        let ee: EventEmitter;
        let ee2: EventEmitter;
        let ee3: EventEmitter;
        let mockRED: any;

        beforeEach(() => {
            ee = new EventEmitter();
            ee.emit = sinon.stub();

            ee2 = new EventEmitter();
            ee2.emit = sinon.stub();

            ee3 = new EventEmitter();
            ee3.emit = sinon.stub();

            (AlexaHandler as any).eventEmitters = {
                '/some/other/url': [ee3],
                '/some/url': [ee, ee2],
            };

            mockRED = {
                httpNode: {
                    _router: {
                        stack: [{
                            route: {
                                methods: {
                                    post: true,
                                },
                                path: '/some/url',
                            },
                        },
                        {
                            route: {
                                methods: {
                                    post: true,
                                },
                                path: '/some/other/url',
                            },
                        }],
                    },
                },
            };
        });

        it ('should do nothing when called with URL that has no array', () => {
            AlexaHandler.unlisten(mockRED, '/some/bad/url', ee);

            expect(mockRED.httpNode._router.stack.length).to.deep.equal(2);
            expect((AlexaHandler as any).eventEmitters['/some/url'].length).to.deep.equal(2);
            expect((AlexaHandler as any).eventEmitters['/some/other/url'].length).to.deep.equal(1);
        });

        it ('should remove the event emitter from the array but not the listener', () => {
            AlexaHandler.unlisten(mockRED, '/some/url', ee);

            expect(mockRED.httpNode._router.stack.length).to.deep.equal(2);
            expect((AlexaHandler as any).eventEmitters['/some/url']).to.deep.equal([ee2]);
            expect((AlexaHandler as any).eventEmitters['/some/other/url'].length).to.deep.equal(1);
        });

        it ('should remove the event emitter from the array and the listener when emitter was only in array', () => {
            AlexaHandler.unlisten(mockRED, '/some/other/url', ee3);

            expect(mockRED.httpNode._router.stack.length).to.deep.equal(1);
            expect(mockRED.httpNode._router.stack[0].route.path).to.deep.equal('/some/url');
            expect((AlexaHandler as any).eventEmitters['/some/url'].length).to.deep.equal(2);
            expect((AlexaHandler as any).eventEmitters['/some/other/url'].length).to.deep.equal(0);
        });
    });

    describe ('speak', () => {
        let fakeMessage;
        let expectedMessage;

        beforeEach(() => {
            fakeMessage = {
                res: {
                    send: sinon.stub(),
                },
            };

            expectedMessage = {
                response: {
                    directives: [],
                    outputSpeech: {
                        type: 'PlainText',
                    },
                    type: '_DEFAULT_RESPONSE',
                },
                sessionAttributes: {},
                version: '1.0',
            };
        });

        it ('should use the node message in speak request', () => {
            AlexaHandler.speak('some message', fakeMessage);

            expectedMessage.response.outputSpeech.text = 'some message';
            expectedMessage.response.shouldEndSession = true;

            expect(fakeMessage.res.send).to.have.been.calledOnceWithExactly(expectedMessage);
        });

        it ('should use the message in msg in speak request when valid type', () => {
            fakeMessage.message = 'some other message';

            AlexaHandler.speak('some message', fakeMessage);

            expectedMessage.response.outputSpeech.text = 'some other message';
            expectedMessage.response.shouldEndSession = true;

            expect(fakeMessage.res.send).to.have.been.calledOnceWithExactly(expectedMessage);
        });

        it ('should use the node message in speak request when message in msg not valid type', () => {
            fakeMessage.message = {};

            AlexaHandler.speak('some message', fakeMessage);

            expectedMessage.response.outputSpeech.text = 'some message';
            expectedMessage.response.shouldEndSession = true;

            expect(fakeMessage.res.send).to.have.been.calledOnceWithExactly(expectedMessage);
        });

        it ('should use the passed end session value', () => {
            AlexaHandler.speak('some message', fakeMessage, false);

            expectedMessage.response.outputSpeech.text = 'some message';
            expectedMessage.response.shouldEndSession = false;

            expect(fakeMessage.res.send).to.have.been.calledOnceWithExactly(expectedMessage);
        });
    });
});
