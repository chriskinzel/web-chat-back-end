import express = require('express');
import cors = require('cors');
import cookieParser = require('socket.io-cookie-parser');
import path = require('path');

import * as socketio from 'socket.io';
import {SocketIOChatServer} from './socket-io-chat-server';

const app = express();

const http = require('http').Server(app);
const io = socketio(http);

const publicDir = path.join(__dirname, '../public');

app.use(cors({
    origin: 'http://localhost:4200',
    credentials : true
}));

app.use('/', express.static(publicDir));

app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

io.use(cookieParser());

const chatServer = new SocketIOChatServer(io);
chatServer.start();

http.listen(3000, () => {
    console.log('Server listening on port 3000');
});
