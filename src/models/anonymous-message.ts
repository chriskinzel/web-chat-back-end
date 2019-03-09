import {Message} from './message';

export class AnonymousMessage extends Message {
    constructor(content: string) {
        super(content, null, null);
    }
}
