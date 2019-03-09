import * as socketio from 'socket.io';

import {CommandParser, InvalidCommandError} from './command-parser';
import {b, div, li, span, ul} from './html-functions';
import {AnonymousMessage} from './models/anonymous-message';
import {Message} from './models/message';
import {User} from './models/user';

export class SocketIOChatServer {
    private running = false;

    private readonly userMap = new Map<string, {user: User, refCount: number}>();
    private readonly messages: Message[] = [];

    constructor(private readonly io: socketio.Server) {}

    public start() {
        if (!this.running) {
            this.setupSocketIOListeners();
            this.running = true;
        }
    }

    private setupSocketIOListeners() {
        this.io.on('connection', clientSocket => {
            const previousUser = User.fromJSON(clientSocket.request.cookies.user);
            if (previousUser && this.userMap.has(previousUser.name)) {
                // This user is already in the chat just in a different browser window
                const userRef = this.userMap.get(previousUser.name);
                userRef.refCount += 1;

                this.onNewUserConnected(userRef.user, clientSocket);
            } else {
                // This user has either used the application before but is not using it
                // currently in another browser window or tab or is a completely new user
                const user = previousUser || new User();

                this.userMap.set(user.name, {user: user, refCount: 1});

                // Tell all clients about the new User
                this.io.emit('newUser', user);

                this.onNewUserConnected(user, clientSocket);
            }
        });
    }

    private onNewUserConnected(user: User, clientSocket: socketio.Socket) {
        const commandParser = new CommandParser();
        commandParser.on('help', () => {
            this.sendHelpMessageToClient(clientSocket);
        });

        commandParser.on('nick', [/.*?/], newNickName => {
            this.setUserNickName(user, clientSocket, newNickName);
        });

        commandParser.on('nickcolor', [/(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})?/],
                color => {
                    this.setUserColor(user, color);
                },
                misformattedColor => {
                    this.sendErrorMessageToUser(clientSocket,
                        `\\nickcolor ${misformattedColor} - '${misformattedColor}' is not a valid three or six digit hexadecimal color.`
                    )
                });

        // Tell new user who they are
        clientSocket.emit('setUser', user);

        // Give new user the list of other users in the chat
        clientSocket.emit('listUsers', this.users);

        // Give new user the chat log
        clientSocket.emit('listMessages', this.messages);

        // First message for the user in the chat log is who they are
        clientSocket.emit('newMessage', new AnonymousMessage(
            `You are ${boldColoredUserName(user)}.`
        ));

        // Listen for messages from client
        clientSocket.on('sendMessage', messageContent => {
            // Check if message is command
            try {
                commandParser.parseCommand(messageContent);
            } catch (e) {
                if (e instanceof InvalidCommandError) {
                    // Broadcast message to all clients
                    const message = new Message(messageContent, user);
                    this.broadcastChatMessage(message);
                } else {
                    throw e;
                }
            }
        });

        clientSocket.on('disconnect', () => {
            this.onUserLeave(user);
        });
    }

    private broadcastChatMessage(message: Message) {
        this.messages.push(message);
        this.io.emit('newMessage', message);
    }

    private onUserLeave(user: User) {
        const userRef = this.userMap.get(user.name);
        if (userRef.refCount === 1) {
            this.userMap.delete(user.name);

            // Tell all clients to remove the user that just left the chat
            this.io.emit('removeUser', user);
        } else {
            userRef.refCount -= 1;
            this.userMap.set(user.name, userRef);
        }
    }

    private sendHelpMessageToClient(clientSocket: socketio.Socket) {
        clientSocket.emit('newMessage', new AnonymousMessage(
            span({},
                b({}, `List of available commands:`),
                ul({},
                    li({}, b({}, '\\help'), div({},
                        '- prints this help message'
                    )),
                    li({}, b({}, '\\nick [nickname]'), div({},
                        '- change your nickname to ', b({}, '[nickname]'), ' or leave empty for a new random nickname'
                    )),
                    li({}, b({}, '\\nickcolor [',
                        span({color: 'red'}, 'RR'),
                        span({color: 'green'}, 'GG'),
                        span({color: 'blue'}, 'BB'),
                        '] | [',
                        span({color: 'red'}, 'R'),
                        span({color: 'green'}, 'G'),
                        span({color: 'blue'}, 'B'), ']'),
                        div({},
                            '- change your nickname color to the specified hexadecimal color code or leave empty for a random color'
                        )
                    )
                )
            )
        ));
    }

    private setUserNickName(user: User, clientSocket: socketio.Socket, nickname?: string) {
        if (user.name !== nickname) {
            if (nickname === undefined) {
                do {
                    nickname = new User().name;
                } while (this.userMap.has(nickname));
            }

            if (!this.userMap.has(nickname)) {
                const oldName = user.name;

                const userRef = this.userMap.get(oldName);
                this.userMap.delete(oldName);

                userRef.user.name = nickname;
                this.userMap.set(nickname, userRef);

                this.io.emit('updateUser', {target: oldName, updatedUser: userRef.user});

                this.io.emit('newMessage', new AnonymousMessage(
                    `${boldColoredText(oldName, userRef.user.color)} changed their nickname to ${boldColoredUserName(userRef.user)}.`
                ));
            } else {
                this.sendErrorMessageToUser(clientSocket,
                    `\\nick ${nickname} - '${nickname}' is already taken.`
                )
            }
        }
    }

    private setUserColor(user: User, color?: string) {
        if (color === undefined) {
            color = new User().color;
        } else {
            color = '#' + color;
        }

        const oldColor = user.color;
        user.color = color;

        this.io.emit('updateUser', {target: user.name, updatedUser: user});

        this.io.emit('newMessage', new AnonymousMessage(
            `${boldColoredUserName(user)} changed their color from ${boldColoredText('this', oldColor)} to ${boldColoredText('this', user.color)}.`
        ));
    }

    private sendErrorMessageToUser(clientSocket: socketio.Socket, errorMessage: string) {
        clientSocket.emit('newMessage', new AnonymousMessage(
            boldColoredText(`ERROR: ${errorMessage}`, 'red')
        ));
    }

    private get users(): User[] {
        return Array.from(this.userMap.values()).map(userRef => userRef.user);
    }
}

function boldColoredUserName(user: User): string {
    return boldColoredText(user.name, user.color);
}

function boldColoredText(text: string, color: string): string {
    return b({}, span({color: color}, text));
}
