import * as chai from 'chai';
import * as cookieParser from 'cookie-parser';
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
                                    some: 'slot',
                                },
                            },
                            type: 'IntentRequest',
                        },
                    },
                };
            });

            it ('should call emit on the event listeners until message is actioned', () => {
                const ee4 = AlexaHandler.listen(mockRED, '/some/url');
                ee4.emit = sinon.stub();

                const calllback = postStub.getCall(0).args[postStub.getCall(0).args.length - 2];

                calllback(req, res);

                const expectedMessage: any = {
                    actioned: true,
                    payload: req.body,
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
                const ee4 = AlexaHandler.listen(mockRED, '/some/url');
                ee4.emit = sinon.stub();

                const calllback = postStub.getCall(0).args[postStub.getCall(0).args.length - 2];

                req.body.request.type = 'not IntentRequest';

                calllback(req, res);

                // tslint:disable-next-line: no-unused-expression
                expect(ee.emit).to.have.not.been.called;
                // tslint:disable-next-line: no-unused-expression
                expect(ee2.emit).to.have.not.been.called;
                // tslint:disable-next-line: no-unused-expression
                expect(ee3.emit).to.have.not.been.called;
                // tslint:disable-next-line: no-unused-expression
                expect(ee4.emit).to.have.not.been.called;
            });
        });
    });
});
