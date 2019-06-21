import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import { EventEmitter } from './event-emitter';

const reqResNext = (req, res, next) => { next(); };
        
const httpMiddleware = reqResNext;
const corsHandler = reqResNext;
const metricsHandler = reqResNext;
const jsonParser = bodyParser.json();
const urlencParser = bodyParser.urlencoded({extended:true});
const multipartParser = reqResNext;
const rawBodyParser = reqResNext;

interface IEventListeners {
    [s: string]: EventEmitter[];
}

export class AlexaHandler {
    private static eventEmitters: IEventListeners = {};

    public static listen(RED: any, url: string): EventEmitter {
        const HTTPExists = RED.httpNode._router && RED.httpNode._router.stack && RED.httpNode._router.stack.some(function(route,i,routes) {
            return route.route && route.route.path === url && route.route.methods['post'];
        });

        const eventEmitter = new EventEmitter();

        if (!Array.isArray(this.eventEmitters[url])) {
            this.eventEmitters[url] = [];
        }

        this.eventEmitters[url].push(eventEmitter);

        if (!HTTPExists) {
            const callback = (req, res) => {
                const body = req.body;
    
                if (body.request.type === 'IntentRequest') {
    
                    const intent = body.request.intent.name;
                    const slots = body.request.intent.slots;
    
                    const msg = {} as any;
                    msg.payload = body;
                    msg.payload.intent = intent;
                    msg.payload.slots = slots;
                    msg.res = res;
                    msg.req = req;

                    this.eventEmitters[url].forEach((eventEmitter) => {
                        eventEmitter.emit('INTENT_REQUEST', msg);
                    });
                }
            }
    
            const errorHandler = (err, req, res, next) => {
                console.warn(err);
                res.sendStatus(500);
            };
    
            RED.httpNode.post(
                url,
                cookieParser(),
                httpMiddleware,
                corsHandler,
                metricsHandler,
                jsonParser,
                urlencParser,
                multipartParser,
                rawBodyParser,
                callback,
                errorHandler
            );
        }

        return eventEmitter;
    }

    public static unlisten(RED, url: string, eventEmitter: EventEmitter) {
        const selectedEventEmitters = this.eventEmitters[url];

        if (Array.isArray(selectedEventEmitters)) {
            for (let i = selectedEventEmitters.length - 1; i >= 0; i--) {
                if (selectedEventEmitters[i].id === eventEmitter.id) {
                    selectedEventEmitters.splice(i, 1);
                }
            }

            if (selectedEventEmitters.length === 0) {
                RED.httpNode._router.stack.forEach(function(route,i,routes) {
                    if (route.route && route.route.path === url && route.route.methods['post']) {
                        routes.splice(i, 1);
                    }
                });
            }
        }
    }

    public static speak(nodeMessage: string, msg: {[s: string]: any, message: string | boolean | number}, endSession = true) {
        let message: string | boolean | number = nodeMessage;

        const allowedTypes = ['string', 'number', 'boolean'];

        if (msg.hasOwnProperty('message') && allowedTypes.includes(typeof msg.message)) {
            message = msg.message;
        }

        msg.res.send({
            "version": "1.0",
            "response": {
                'outputSpeech': {
                    'type': 'PlainText',
                    'text': message
                },
                "directives": [],
                "shouldEndSession": endSession,
                "type": "_DEFAULT_RESPONSE"
            },
            "sessionAttributes": {}
        });
    }
}