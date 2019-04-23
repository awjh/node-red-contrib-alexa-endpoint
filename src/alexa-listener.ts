import { Red, NodeProperties } from 'node-red';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as _ from 'lodash';

export = (RED: Red) => {
    const basicReqResNext = (req: Request, res: Response, next) => { next(); }
    const jsonParser = bodyParser.json({
        limit: '5mb'
    });
    const urlencParser = bodyParser.urlencoded({
        limit: '5mb',
        extended: true
    });

    interface IAlexaInProps extends NodeProperties {
        url?: string;
        intents: string[];
    }

    function alexaIn(n: IAlexaInProps) {

        RED.nodes.createNode(this, n);

        const node = this;

        let url = '/';

        if (n.url) {
            url = n.url.startsWith('/') ? n.url : '/' + n.url;
        }

        this.intents = n.intents || [];

        console.log(n, 'INTENTS');

        this.errorHandler = function(err, req, res, next) {
            node.warn(err);
            res.sendStatus(500);
        };

        this.callback = function(req,res) {
            var msgid = RED.util.generateId();
            res._msgid = msgid;

            const payload = req.body;

            if (payload.request && payload.request.type === 'IntentRequest') {
                payload.intent = payload.request.intent.name;
                payload.slots = _.cloneDeep(payload.request.intent.slots);
            }

            node.send({
                _msgid: msgid,
                req: req,
                res: createResponseWrapper(node,res),
                payload
            });
        };

        RED.httpNode.post(
            url,
            cookieParser(),
            basicReqResNext,
            basicReqResNext,
            basicReqResNext,
            jsonParser,
            urlencParser,
            basicReqResNext,
            basicReqResNext,
            this.callback,
            this.errorHandler
        );
    }
    RED.nodes.registerType("alexa-listener", alexaIn);

    function createResponseWrapper(node: any, res: Response) {
        var wrapper = {
            _res: res
        };
        const toWrap = [
            "append",
            "attachment",
            "cookie",
            "clearCookie",
            "download",
            "end",
            "format",
            "get",
            "json",
            "jsonp",
            "links",
            "location",
            "redirect",
            "render",
            "send",
            "sendfile",
            "sendFile",
            "sendStatus",
            "set",
            "status",
            "type",
            "vary"
        ];
        toWrap.forEach(function(f) {
            wrapper[f] = function() {
                node.warn((RED as any)._("httpin.errors.deprecated-call", { method: "msg.res." + f }));
                var result = res[f].apply(res,arguments);
                if (result === res) {
                    return wrapper;
                } else {
                    return result;
                }
            }
        });
        return wrapper;
    }
}