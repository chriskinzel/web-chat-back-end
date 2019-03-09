import express = require('express');
import cors = require('cors');
import cookieParser = require('socket.io-cookie-parser');

import * as socketio from 'socket.io';
import {SocketIOChatServer} from './socket-io-chat-server';

const app = express();

const http = require('http').Server(app);
const io = socketio(http);

app.use(cors({
    origin: 'http://localhost:4200',
    credentials : true
}));

io.use(cookieParser());

const chatServer = new SocketIOChatServer(io);
chatServer.start();

http.listen(3000, () => {
    console.log('Server listening on port 3000');
});
