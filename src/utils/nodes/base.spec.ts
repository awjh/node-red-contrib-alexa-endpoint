import * as chai from 'chai';
import { NodeProperties } from 'node-red';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { BaseNode } from './base';

// tslint:disable-next-line: no-var-requires
const Node = require('@node-red/runtime/lib/nodes/Node.js');

const expect = chai.expect;
chai.use(sinonChai);

describe ('#BaseNode', () => {
    let mockConfig: NodeProperties;

    let mockRED: {
        nodes: {
            createNode: sinon.SinonStub;
            registerType: sinon.SinonStub;
        },
    };

    beforeEach(() => {
        mockConfig = {
            id: 'some type',
            name: 'some name',
            type: 'some type',
        };

        mockRED = {
            nodes: {
                createNode: sinon.stub(),
                registerType: sinon.stub(),
            },
        };
    });

    describe ('constructor', () => {
        it ('should set the values', () => {
            const baseNode = new BaseNode(mockRED as any, mockConfig);

            expect(baseNode.name).to.deep.equal('some name');
            expect(baseNode.RED).to.deep.equal(mockRED);
            expect((baseNode as any).config).to.deep.equal(mockConfig);
        });
    });

    describe ('setupNode', () => {
        it ('should call create node', () => {
            const baseNode = new BaseNode(mockRED as any, mockConfig);

            baseNode.setupNode();

            expect(mockRED.nodes.createNode).to.have.been.calledOnceWithExactly(
                baseNode, JSON.parse(JSON.stringify(mockConfig)),
            );
        });
    });
});
