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

commandParser.on<CommandListenerData>('help', event => {
    event.data.socket.emit('newMessage', new AnonymousMessage(
        `<b>List of available commands:</b>
<ul>
<li><b>\\help</b><div>- prints this help message</div></li>
<li><b>\\nick [nickname]</b><div>- change your nickname to <b>[nickname]</b> or leave empty for a new random nickname</div></li>
<li><b>\\nickcolor [<span style="color: red">RR</span><span style="color: green">GG</span><span style="color: blue">BB</span>] | [<span style="color: red">R</span><span style="color: green">G</span><span style="color: blue">B</span>]</b><div>- change your nickname color to the specified hexadecimal color code or leave empty for a random color</div></li>
</ul>`
    ));
});

commandParser.on<CommandListenerData>('nick', [/.*?/], (event, newNickName) => {
    if (event.data.user.name !== newNickName) {
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

            io.emit('updateUser', {target: oldName, updatedUser: userRef.user});

            io.emit('newMessage', new AnonymousMessage(
                `<b><span style="color: ${userRef.user.color}">${oldName}</span></b> changed their nickname to <b><span style="color: ${userRef.user.color}">${userRef.user.name}</span></b>.`
            ));
        } else {
            event.data.socket.emit('newMessage', new AnonymousMessage(
                `<b><span style="color: red">ERROR: \\nick ${newNickName} - '${newNickName}' is already taken.</span></b>`
            ));
        }
    }
});

commandParser.on<CommandListenerData>('nickcolor', [/(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})?/],(event, color) => {
    if (color === undefined) {
        color = new User().color;
    } else {
        color = '#' + color;
    }

    const user = event.data.user;
    const oldColor = user.color;
    user.color = color;

    io.emit('updateUser', {target: user.name, updatedUser: user});

    io.emit('newMessage', new AnonymousMessage(
        `<b><span style="color: ${user.color}">${user.name}</span></b> changed their color from <b><span style="color: ${oldColor}">this</span></b> to <b><span style="color: ${user.color}">this</span></b>.`
    ));
}, (event, misformattedColor) => {
    event.data.socket.emit('newMessage', new AnonymousMessage(
        `<b><span style="color: red">ERROR: \\nickcolor ${misformattedColor} - '${misformattedColor}' is not a valid three or six digit hexadecimal color.</span></b>`
    ));
});

io.on('connection', clientSocket => {
    const previousUser = User.fromJSON(clientSocket.request.cookies.user);
    const sessionUser = previousUser && users.get(previousUser.name) && users.get(previousUser.name).user;
    const user = sessionUser || previousUser || new User();

    if (users.has(user.name)) {
        const userRef = users.get(user.name);
        userRef.refCount += 1;
    } else {
        users.set(user.name, {user: user, refCount: 1});

        // Tell all clients about the new User
        io.emit('newUser', user);
    }

    // Tell new user who they are
    clientSocket.emit('setUser', user);

    // Give new user the list of other users in the chat
    clientSocket.emit('listUsers', Array.from(users.values()).map(userRef => userRef.user));

    // Give new user the chat log
    clientSocket.emit('listMessages', messages);

    // First message for the user in the chat log is who they are
    clientSocket.emit('newMessage', new AnonymousMessage(
        `You are <b><span style="color: ${user.color}">${user.name}</span></b>.`
    ));

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
