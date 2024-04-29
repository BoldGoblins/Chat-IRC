import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import config from 'config';

import socket from './socket';

const port = config.get<number>("port");
const host = config.get<string>("host");
const corsOrigin = config.get<string>("corsOrigin");

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors:{
        origin: corsOrigin,
        credentials: true,
    },
});

// app.get('/', (req, res) => res.send(`Server is up`));

httpServer.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}/`);

    socket({ io });
});


import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoose, { mongo } from 'mongoose';

import router from './router';

// import socket from './socket';

app.use(cors({
    credentials: true,
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

// const server = http.createServer(app);

// const socketIO = require('socket.io');

// const io = socketIO(server);

// const port = process.env.PORT || 4000

// server.listen(port, () => {
//     console.log(`Server running on http://localhost:${port}/`);

//     socket({ io });
// })

const MONGO_URL = 'mongodb+srv://STG-13:4Y4hQSj8E7sAIZs7@cluster0.oryxnhw.mongodb.net/?retryWrites=true&w=majority'

mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on('error', (error: Error) => console.log(error));

app.use('/', router());