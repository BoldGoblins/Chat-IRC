import { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import EVENTS from '../config/events';

interface Context {
    socket: Socket;
    username?: string;
    setUsername: Function;
    messages?: {message: string, time: string, username: string}[];
    setMessages: Function;
    roomId?: string;
    rooms: object;
    users?: string[];
    setUsers?: Function;
};

const audio = new Audio('/notification.ogg');

const socket = io(`http://localhost:4000`);

const SocketContext = createContext<Context>({ 
    socket, 
    setUsername: () => false,
    setMessages: () => false,
    rooms: {},
    messages: [],
});

function SocketsProvider(props: any) {
    const [username, setUsername] = useState("");
    const [roomId, setRoomId] = useState("");
    const [rooms, setRooms] = useState({});
    const [messages, setMessages] = useState<any[]>([]);
    const [users, setUsers] = useState<object>({});

    useEffect(() => {
        window.onfocus = () => {
            document.title = "EPI-IRC";
        }
    }, []);

    socket.on(EVENTS.SERVER.ROOMS, (value) => {
        setRooms(value);
    });

    socket.on(EVENTS.SERVER.JOINED_ROOM, (value) => {
        setRoomId(value);

        setMessages([]);
    });

    socket.on(EVENTS.SERVER.ROOM_MESSAGE, ({ message, username, time }) => {
        if(!document.hasFocus()) {
            document.title = "New message...";
            playNotificationSound();
        }

        setMessages([...messages, { message, username, time }]);
    });

    socket.on(EVENTS.SERVER.USERS_LIST, (users) => {
        setUsers(users);
    });

    const playNotificationSound = () => {
        audio.currentTime = 0;
        audio.play();
    };

    return (
    <SocketContext.Provider 
        value={{
            socket,
            username,
            setUsername,
            rooms,
            roomId,
            messages,
            setMessages,
            users,
            setUsers,
        }} 
        {...props} 
    />
    );
}

export const useSockets = () => useContext(SocketContext);

export default SocketsProvider;
