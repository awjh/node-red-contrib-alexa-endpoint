export function speak(defaultMessage: string, msg, endSession = true) {
    let message = defaultMessage;

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