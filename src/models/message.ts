import {User} from './user';

export class Message {
    readonly content: string;
    readonly user: User | undefined;
    readonly timestamp: Date | undefined;

    constructor(message: string, user?: User) {
        this.content = message;
        this.user = user;
        this.timestamp = new Date();
    }
}
