import { Red } from 'node-red';
import * as sinon from 'sinon';

export function registerType (RED: Red, type: string, nodeClass: any) {
    // scarily hacky to get around that local node-red may be different to global
    const stub = sinon.stub(Object, 'setPrototypeOf');
    RED.nodes.registerType(type, nodeClass);
    stub.restore();
}
