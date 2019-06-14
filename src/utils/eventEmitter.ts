import { EventEmitter as StandardEventEmitter } from 'events';
import * as uuid from 'uuid/v4';

export class EventEmitter extends StandardEventEmitter {
    public readonly id: string;

    constructor() {
        super();

        this.id = uuid();
    }
}