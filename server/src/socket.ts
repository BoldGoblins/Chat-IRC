import { v4 as uuidv4 } from 'uuid';
import { Server, Socket } from 'socket.io';
import moment from 'moment';
import config from 'config';

const port = config.get<number>("port");
const host = config.get<string>("host");

const EVENTS = {
    connection: 'connection',
    CLIENT:{
        CREATE_ROOM: 'CREATE_ROOM',
        SEND_ROOM_MESSAGE: 'SEND_ROOM_MESSAGE',
        JOIN_ROOM: 'JOIN_ROOM',
        SET_USERNAME: 'SET_USERNAME',
        LEAVE_ROOM: 'LEAVE_ROOM',
    },
    SERVER:{
        ROOMS: 'ROOMS',
        JOINED_ROOM: 'JOINED_ROOM',
        ROOM_MESSAGE: 'ROOM_MESSAGE',
        USERS_LIST: 'USERS_LIST',
    },
};

interface Room {
    name: string;
    users: string[];
}

interface Users {
    name: string;
}

const rooms: Record<string, Room> = {};
const usernames: Record<string, string> = {};
const usernamesList: Record<string, Users> = {};


function getRooms() {

    /** Get Rooms */

    fetch(`http://${host}:${port}/rooms`)
    .then(response => response.json())
    .then(data => {
        data.forEach((room: { roomId: string; name: string }) => {
            rooms[room.roomId] = { name: room.name, users: [] };
        });
    })
    .catch(error => console.log(error));
}

function getUsernames() {

    /** Get Usernames */

    fetch(`http://${host}:${port}/users`)
    .then(response => response.json())
    .then(data => {
        data.forEach((user: { username: string }) => {
            usernamesList[user.username] = { name: user.username };
        });
    })
    .catch(error => console.log(error));

    console.log(usernamesList);
}

function getRealUsernames() {
    const realUsernames: string[] = [];
    for (const id in usernames) {
        if (usernames.hasOwnProperty(id)) {
            realUsernames.push(usernames[id]);
        }
    }
    return realUsernames;
}

function getMessages(roomId: string, callback: (messages: any[]) => void) {

    //* Get Messages From Room */

    fetch(`http://${host}:${port}/messages`)
    .then(response => response.json())
    .then(data => {
        const filteredMessages = data.filter((message: { roomId: string }) => message.roomId === roomId);

        callback(filteredMessages);
    })
    .catch(error => console.log(error));
}


function socket({ io }: { io: Server }) {
    console.log("Sockets enabled");
    getRooms();

    io.on(EVENTS.connection, (socket: Socket) => {
        usernames[socket.id] = `User-${Math.random().toString(36).substring(2,10)}`;

        console.log(usernames[socket.id])

        console.log(`User connected ${socket.id}`);

        socket.emit(EVENTS.SERVER.ROOMS, rooms);

        socket.emit(EVENTS.SERVER.USERS_LIST, getRealUsernames());

        /*
        * User creates a room
        */
        socket.on(EVENTS.CLIENT.CREATE_ROOM, ({ roomName }) => {
            console.log({ roomName });

            // const quitRoomId = Object.keys(rooms).find(roomId => rooms[roomId].users.includes(usernames[socket.id]));

            // handleQuitCommand(socket, quitRoomId);

            const roomId = uuidv4();

            rooms[roomId] = {
                name: roomName,
                users: [],
            };

            socket.join(roomId);

            socket.broadcast.emit(EVENTS.SERVER.ROOMS, rooms);

            socket.emit(EVENTS.SERVER.ROOMS, rooms);

            socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);

            /** Save Rooms */

            fetch(`http://${host}:${port}/rooms`, {
                method: 'POST',
                headers: {
                    Accept: 'application.json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ roomId, name: roomName })
            }).catch (
              error => {console.log(error)}
            );
        });

        /**
         * User sets a username
         */

        socket.on(EVENTS.CLIENT.SET_USERNAME, (username: string) => {
            handleNickCommand(socket, username);
            console.log(`Setting username ${username} for socket ${socket.id}`);
            // usernames[socket.id] = username;
            socket.emit(EVENTS.SERVER.USERS_LIST, getRealUsernames());
        });

        /**
        * User sends a message to a room
        */
        socket.on(EVENTS.CLIENT.SEND_ROOM_MESSAGE, async ({ roomId, message }) => {
            const time = moment();

            if(message.startsWith('/')) {
                doCommands(socket, message, rooms, roomId);
                return;
            }

            socket.to(roomId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
                message,
                username: usernames[socket.id],
                time,
            });

            /** Save Messages */
            
            fetch(`http://${host}:${port}/messages`, {
                method: 'POST',
                headers: {
                    Accept: 'application.json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ roomId, message, username: usernames[socket.id], time })
            }).catch (
              error => {console.log(error)}
            );
        });

        /**
         * User joins a room
         */
        socket.on(EVENTS.CLIENT.JOIN_ROOM, (roomId) => {
            const time = moment();

            socket.join(roomId);

            rooms[roomId].users.push(usernames[socket.id]);

            socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);

            getMessages(roomId, (messages) => {

                // console.log(messages);
                emitMessagesOneByOne(socket, messages);
            });

            socket.to(roomId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
                message: `${usernames[socket.id]} joined the room`,
                time,
            });
        });

        socket.on(EVENTS.CLIENT.LEAVE_ROOM, (roomId) => {
            handleQuitCommand(socket, roomId);
        });

        socket.on('disconnect', () => {
            const username = usernames[socket.id];
            console.log(`User disconnected ${socket.id}`);
            for (const roomId in rooms) {
                if (rooms.hasOwnProperty(roomId)) {
                    rooms[roomId].users = rooms[roomId].users.filter(user => user !== username);
                }
            }

            delete usernames[socket.id];

            for (const roomId in rooms) {
                if (rooms.hasOwnProperty(roomId)) {
                    io.to(roomId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
                        message: `${username} has disconnected.`,
                    });
                }
            }

            socket.emit(EVENTS.SERVER.USERS_LIST, getRealUsernames());
        });
    });
};

function emitMessagesOneByOne(socket: Socket, messages: any[], index = 0, delay = 5) {
    if (index < messages.length) {
        const { message, username, time } = messages[index];

        socket.emit(EVENTS.SERVER.ROOM_MESSAGE, { message, username, time });

        setTimeout(() => {
            emitMessagesOneByOne(socket, messages, index + 1, delay);
        }, delay);
    }
}

/**
 * Gestion of all commands input
 */
function doCommands(socket: Socket, command: string, rooms: Record<string, { name: string }>, roomId: string) {
    const [cmd, ...args] = command.split(' ');

    switch (cmd) {
        case '/nick':
            handleNickCommand(socket, args.join(' '));
            break;
        case '/list':
            handleListCommand(socket, rooms, args);
            break;
        case '/create':
            handleCreateCommand(socket, args.join(' '), roomId);
            break;
        case '/delete':
            handleDeleteCommand(socket, args.join(' '), roomId);
            break;
        case '/join':
            handleJoinCommand(socket, args.join(' '));
            break;
        case '/quit':
            handleQuitCommand(socket, roomId);
            break;
        case '/users':
            handleUsersCommand(socket, roomId);
            break;
        case '/msg':
            const [nickname, ...message] = args;
            handleMsgCommand(socket, nickname, message.join(' '));
            break;
        default:
            break;
    }
};

/**
 *  /nick <string>
 */
export const handleNickCommand = (socket: Socket, newUsername: string) => {
    const oldUsername = usernames[socket.id];
    
    if (oldUsername === newUsername) {
        return;
    }

    const listOfUsername = Object.values(usernames);

    for (const username of listOfUsername) {
        console.log(`username: ${username}`);
        if (newUsername === username) {
            socket.emit(EVENTS.SERVER.ROOM_MESSAGE, {
                message: 'Username already taken. Please choose another one.',
                });
            return;
        }
    }
    
    usernames[socket.id] = newUsername;

    for (const roomId in rooms) {
        if (rooms[roomId].users.includes(oldUsername)) {
            const index = rooms[roomId].users.indexOf(oldUsername);
            rooms[roomId].users[index] = newUsername;
            socket.to(roomId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
                message: `${oldUsername} changed their name to ${newUsername}.`,
                time: moment(),
            });
        }
    }
};

/**
 *  /list <string> ✔
 */
export const handleListCommand = (socket: Socket, rooms: Record<string, { name: string }>, args: string[]) => {

    let roomNames = Object.values(rooms).map(room => room.name);

    if(args.length > 0) {
        roomNames = roomNames.filter(roomName => args.some(arg => roomName.toLowerCase().includes(arg.toLowerCase())));
    }

    socket.emit(EVENTS.SERVER.ROOM_MESSAGE, {
        message:`List of Rooms: ${roomNames.join(', ')}`,
    });
};

/**
 *  /create <string> ✔
 */
export const handleCreateCommand = (socket: Socket, channelName: string, quitRoomId: string) => {
    handleQuitCommand(socket, quitRoomId);

    const roomId = uuidv4();

    rooms[roomId] = {
        name: channelName,
        users: [],
    };

    socket.broadcast.emit(EVENTS.SERVER.ROOMS, rooms);

    socket.emit(EVENTS.SERVER.ROOMS, rooms);

    socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);

    /** Save Rooms */

    fetch(`http://${host}:${port}/rooms`, {
        method: 'POST',
        headers: {
            Accept: 'application.json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomId, name: channelName })
    }).catch (
      error => {console.log(error)}
    );
};

/**
 *  /delete <string> ✔
 */
export const handleDeleteCommand = (socket: Socket, channelName: string, quitRoomId: string) => {
    handleQuitCommand(socket, quitRoomId);

    const roomId = Object.keys(rooms).find(roomId => rooms[roomId].name === channelName);
    if (!roomId) {
        socket.emit(EVENTS.SERVER.ROOM_MESSAGE, {
            message: `Room '${channelName}' not found.`,
        });
        return;
    }

    console.log(roomId)

    delete rooms[roomId];

    socket.broadcast.emit(EVENTS.SERVER.ROOMS, rooms);
    socket.emit(EVENTS.SERVER.ROOMS, rooms);

    socket.emit(EVENTS.SERVER.ROOM_MESSAGE, {
        message: `Room '${channelName}' has been deleted.`,
    });

    /** Delete Rooms */

    fetch(`http://${host}:${port}/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
            Accept: 'application.json',
            'Content-Type': 'application/json'
        },
    }).catch (
      error => {console.log(error)}
    );

    /** Delete Messages from the Room */
    fetch(`http://${host}:${port}/messages/${roomId}`, {
        method: 'DELETE',
        headers: {
            Accept: 'application.json',
            'Content-Type': 'application/json'
        },
    }).catch (
      error => {console.log(error)}
    );
};

/**
 *  /join <string> ✔
 */
export const handleJoinCommand = (socket: Socket, roomName: string) => {
    const username = usernames[socket.id];

    if (!username) {
        socket.emit(EVENTS.SERVER.ROOM_MESSAGE, {
            message: 'Please set a username before joining a room.',
        });
        return;
    }

    const roomEntry = Object.entries(rooms).find(
        ([roomId, room]) => room.name === roomName
    );

    if (!roomEntry) {
        socket.emit(EVENTS.SERVER.ROOM_MESSAGE, {
            message: `Room '${roomName}' not found.`,
        });
        return;
    }

    const [roomId, room] = roomEntry;

    socket.join(roomId);
    room.users.push(username);

    socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);

    getMessages(roomId, (messages) => {
        emitMessagesOneByOne(socket, messages);
    });

    socket.to(roomId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
        message: `${username} joined the room.`,
        time: moment(),
    });

    socket.emit(EVENTS.SERVER.ROOM_MESSAGE, {
        message: `You have joined the room '${room.name}'.`,
        time: moment(),
    });
};

/**
 * /quit <string> + In client side ✔
 */

export const handleQuitCommand = (socket: Socket, roomId: string) => {
    const username = usernames[socket.id];
    if (!username) {
        return;
    }

    if (rooms[roomId]) {
        rooms[roomId].users = rooms[roomId].users.filter(user => user !== username);
    }

    socket.to(roomId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
        message: `${username} has left the room.`,
    });
};

/**
 *  /users ✔
 */
export const handleUsersCommand = (socket: Socket, roomId: string) => {
    const users = rooms[roomId]?.users || [];
    
    socket.emit(EVENTS.SERVER.ROOM_MESSAGE, {
        message: `List of Users in Room: ${users.join(', ')}`,
    });
};

/**
 * /msg <string> <string> ✔
 */
export const handleMsgCommand = (socket: Socket, nickname: string, message: string) => {
    const senderUsername = usernames[socket.id];

    const receiverSocketId = Object.keys(usernames).find(socketId => usernames[socketId] === nickname);

    if (!receiverSocketId) {
        socket.emit(EVENTS.SERVER.ROOM_MESSAGE, {
            message: `User '${nickname}' not found.`,
        });
        return;
    }

    console.log(receiverSocketId)

    socket.to(receiverSocketId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
        message: `‎From ${senderUsername}: ${message}`,
    });

    socket.emit(EVENTS.SERVER.ROOM_MESSAGE, {
        message: `‎To ${nickname}: ${message}`,
    });
};

export default socket;