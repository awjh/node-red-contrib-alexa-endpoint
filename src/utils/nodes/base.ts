import { Node as INode, NodeProperties, Red } from 'node-red';
import { inherits } from 'util';

// tslint:disable-next-line: no-var-requires
const Node = require('@node-red/runtime/lib/nodes/Node.js');

export class BaseNode extends Node  {
    public readonly name: string;
    public readonly RED: Red;
    private config: NodeProperties;

    constructor (RED: Red, config: NodeProperties) {
        super(config);

        this.name = config.name;
        this.RED = RED;
        this.config = config;
    }

    public setupNode () {
        const node = this as any as INode;

        this.RED.nodes.createNode(node, JSON.parse(JSON.stringify(this.config)));
    }

    protected send (msg) {
        const node = this as any as INode;
        node.send(msg);
    }
}
