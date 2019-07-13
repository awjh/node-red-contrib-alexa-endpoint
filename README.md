# Node Red Alexa Endpoints
A set of node red nodes for interaction with Alexa.

## Nodes
### Listener
Listens to POST requests in the format given by Alexa. Parses the request and if it is for an intent listed in its configuration it forwards the request through the corresponding output. If it does not match an intent listed it ignores it.

#### Configuration
- Name: Set the name of the node
- URL: Set the URL the node should listen on relative to the Node-RED URL. If unset it will listen on the Node-RED URL. You should configure your Alexa skill to point to this URL as its endpoint.
- Intent: Set a list of intents to handle. Use the add button in the bottom left corner of the intent section to add an intent. The textbox value should match the name of the intent configured in your Alexa skill. Case sensitive. When a request is made the node will route the output via the corresponding output, top of the list out of top output. If a request does not match any intent listed then no output will occur.

#### Output
When the listener receives a request which matches an intent it routes it through the corresponding output. A node attached to this output will receive the following msg:
- payload - matches the body of the Alexa request with additional fields `intent` and `slots` added. THe `intent` field contains the name of the intent for that request. The `slots` field is an object with the keys of slots that were filled in in the request and their values in the format `<SLOT_NAME>: <SLOT_VALUE>`. Further details on the slots and intents used in the request can be found elsewhere in the payload as it matches the Alexa request's body.
- req - the full request object
- res - the response object, used for replying to the request.

### Speaker
Responds to an Alexa request with the message set in its configuration or payload in plaintext.

#### Configuration
- Name: Set the name of the node
- Message: The string value to be returned as plaintext to the Alexa request. This value is used unless the input to the node has a property of message. That value must be a string, number or boolean value.

#### Input
The node expects an input of the format outputted by the Listener or Speaker-Listener nodes. Requires at a minimum the the res property of the output. If overwriting configured message then it also requires the input `message` property to be set.

### Speaker-Listener
Responds to Alexa with the message set in its configuration or payload (payload overwrites) in plaintext. It then waits for a response (on the set URL) to that message and if the response matches an intent listed in its configuration it forwards the request through the output. If it does not match an intent listed it asks the user to try again.

#### Configuration
- Name: Set the name of the node
- Message: The string value to be returned as plaintext to the Alexa request. This value is used unless the input to the node has a property of message. That value must be a string, number or boolean value.
- URL: Set the URL the node should listen on relative to the Node-RED URL. If unset it will listen on the Node-RED URL. You should configure your Alexa skill to point to this URL as its endpoint.
- Intent: Set a list of intents to handle. Use the add button in the bottom left corner of the intent section to add an intent. The textbox value should match the name of the intent configured in your Alexa skill. Case sensitive. When a request is made the node will route the output via the corresponding output, top of the list out of top output. If a request does not match any intent listed then no output will occur.

#### Input
The node expects an input of the format outputted by the Listener or Speaker-Listener nodes. Requires at a minimum the the res property of the output. If overwriting configured message then it also requires the input `message` property to be set.

#### Output
When the listener receives a request (in the same Alexa session as the initial input to the node) which matches an intent it routes it through the corresponding output. A node attached to this output will receive the following msg:
- payload - matches the body of the Alexa request with additional fields `intent` and `slots` added. THe `intent` field contains the name of the intent for that request. The `slots` field is an object with the keys of slots that were filled in in the request and their values in the format `<SLOT_NAME>: <SLOT_VALUE>`. Further details on the slots and intents used in the request can be found elsewhere in the payload as it matches the Alexa request's body.
- req - the full request object
- res - the response object, used for replying to the request.