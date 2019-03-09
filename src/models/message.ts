import {User} from './user';

export class Message {
    constructor(public readonly content: string,
                public readonly user: User = undefined,
                public readonly timestamp = new Date()) {}
}
