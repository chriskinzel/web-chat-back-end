import express = require('express');
import cors = require('cors');
import * as socketio from 'socket.io';

import {Message} from './models/message';
import {User} from './models/user';

const app = express();

const http = require('http').Server(app);
const io = socketio(http);

app.use(cors({
    origin: 'http://localhost:4200',
    credentials : true
}));

const users: User[] = [];
const messages: Message[] = [];

// TODO: Cookies for persistent username
// TODO: Responsiveness
// TODO: Help, Nickname, and Color commands

io.on('connection', clientSocket => {
    const user = new User();
    const userPosition = users.length;
    users.push(user);

    // Tell new user who they are
    clientSocket.emit('setUser', user);

    // Give new user the list of other users in the chat
    clientSocket.emit('listUsers', users);

    // Tell all clients about the new User
    io.emit('newUser', user);

    // Give new user the chat log
    clientSocket.emit('listMessages', messages);

    // Listen for messages from client
    clientSocket.on('sendMessage', messageContent => {
        // Broadcast message to all clients
        const message = new Message(messageContent, user);
        messages.push(message);

        io.emit('newMessage', message);
    });

    clientSocket.on('disconnect', () => {
        users.splice(userPosition, 1);

        // Tell all clients to remove the user that just left the chat
        io.emit('removeUser', user);
    });
});

http.listen(3000, () => {
    console.log('Server listening on port 3000');
});
