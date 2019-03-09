import express = require('express');
import cors = require('cors');
import cookieParser = require('socket.io-cookie-parser');

import * as socketio from 'socket.io';

import {CommandParser} from './command-parser';
import {AnonymousMessage} from './models/anonymous-message';
import {Message} from './models/message';
import {User} from './models/user';

interface CommandListenerData {
    socket: socketio.Socket;
    user: User;
}

const app = express();

const http = require('http').Server(app);
const io = socketio(http);

app.use(cors({
    origin: 'http://localhost:4200',
    credentials : true
}));

io.use(cookieParser());

const users = new Map<string, {user: User, refCount: number}>();
const messages: Message[] = [];

const commandParser = new CommandParser();
commandParser.on<CommandListenerData>('\\help', event => {
    event.data.socket.emit('newMessage', new AnonymousMessage(
        `<b>List of available commands:</b>
  <b>\\help</b> - prints this help message
  <b>\\nick [nickname]</b> - change your nickname to <b>[nickname]</b> or leave empty for a new random nickname
  <b>\\nickcolor RRGGBB</b> - change your nickname color to the specified hexadecimal color code`
    ));
});
commandParser.on<CommandListenerData>(/\\nick\s+(.*)|\\nick/, (event, newNickName) => {
    if (newNickName === undefined) {
        do {
            newNickName = new User().name;
        } while (users.has(newNickName));
    }

    if (!users.has(newNickName)) {
        const oldName = event.data.user.name;

        const userRef = users.get(oldName);
        users.delete(oldName);

        userRef.user.name = newNickName;
        users.set(newNickName, userRef);

        event.data.socket.emit('setUser', userRef.user);

        io.emit('updateUser', {target: oldName, updatedUser: userRef.user});
    } else {
        event.data.socket.emit('newMessage', new AnonymousMessage(
            `<b><span style="color: red">ERROR: \\nick ${newNickName} - '${newNickName}' is already taken.</span></b>`
        ));
    }
});
commandParser.on<CommandListenerData>(/\\nickcolor\s+([A-Fa-f0-9]{0, 6})/,(event, color) => {
    console.log(color);
});

io.on('connection', clientSocket => {
    const user = User.fromJSON(clientSocket.request.cookies.user) || new User();
    if (users.has(user.name)) {
        const userRef = users.get(user.name);
        userRef.refCount += 1;

        users.set(user.name, userRef);
    } else {
        users.set(user.name, {user, refCount: 1});

        // Tell all clients about the new User
        io.emit('newUser', user);
    }

    // Tell new user who they are
    clientSocket.emit('setUser', user);

    // Give new user the list of other users in the chat
    clientSocket.emit('listUsers', Array.from(users.values()).map(userRef => userRef.user));

    // Give new user the chat log
    clientSocket.emit('listMessages', messages);

    // Listen for messages from client
    clientSocket.on('sendMessage', messageContent => {
        // Check if message is command
        try {
            commandParser.parseCommand(messageContent, {
                socket: clientSocket,
                user: user
            });
        } catch (e) {
            // Broadcast message to all clients
            const message = new Message(messageContent, user);

            messages.push(message);
            io.emit('newMessage', message);
        }
    });

    clientSocket.on('disconnect', () => {
        const userRef = users.get(user.name);
        if (userRef.refCount === 1) {
            users.delete(user.name);

            // Tell all clients to remove the user that just left the chat
            io.emit('removeUser', user);
        } else {
            userRef.refCount -= 1;
            users.set(user.name, userRef);
        }
    });
});

http.listen(3000, () => {
    console.log('Server listening on port 3000');
});
