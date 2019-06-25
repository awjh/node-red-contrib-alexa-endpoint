import { Node, NodeProperties, Red } from 'node-red';

export interface INode {
    setupNode: () => void;
}

export class BaseNode implements INode {
    public readonly name: string;
    public readonly RED: Red;

    constructor (RED: Red, config: NodeProperties) {
        this.name = config.name;
        this.RED = RED;
    }

    public setupNode () {
        const node = this as any as Node;

        this.RED.nodes.createNode(node, JSON.parse(JSON.stringify(this)));
    }

    protected send (msg) {
        const node = this as any as Node;
        node.send(msg);
    }
}
