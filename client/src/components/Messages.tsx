import { useEffect, useRef, useState } from "react";
import { useSockets } from "../context/socket.context";
import moment from 'moment';
import EVENTS from "../config/events";
import styles from "../constant/styles";
import chart from "../constant/chart";
import { NavLink } from "react-router-dom";

function refreshPage() {
    window.location.reload();
}

function MessageContainer() {

    const {socket, messages, roomId, username, setMessages } = useSockets();
    const newMessageRef = useRef<HTMLInputElement>(null);
    const messageEndRef = useRef<HTMLDivElement>(null);
    const messageScrollBox = useRef<HTMLDivElement>(null);

    function handleSendMessage(event: React.FormEvent) {
        event.preventDefault();
        
        if(newMessageRef.current) {
            const message = newMessageRef.current.value;

            if (!String(message).trim()) return;

            if(message.startsWith('/quit')) {
                socket.emit(EVENTS.CLIENT.LEAVE_ROOM, roomId);
                refreshPage();
                return;
            }

            const username = localStorage.getItem("username") || "Anynomous";

            socket.emit(EVENTS.CLIENT.SEND_ROOM_MESSAGE, { roomId, message, username });

            const time = moment();

            setMessages([
                ...(messages || []), 
                {
                    username: 'You',
                    message, 
                    time,
                }
            ]);
        }
    }

    // Called when component load
    useEffect(() => {
        if (messageScrollBox.current !== null)
           messageScrollBox.current.scrollTop = messageScrollBox.current.scrollHeight;

    }, [messages]);


    if(!roomId) {
        return (
        <div className="flex flex-col bg-slate-300 h-full rounded-lg py-4 px-2 justify-between items-center gap-4">
            <span className={`${styles.titleContainer}`}> <h2 className={`${styles.title1W}`}>Welcome on EPI-IRC WorldWide Chat !</h2> </span>

            <img src="/www.jpg" className="w-4/6 h-auto rounded-full shadow-xl shadow-slate-800"/>

            <div className="flex flex-col bg-slate-100 rounded-lg h-4/6 py-4 px-2 border border-black self-stretch overflow-y-auto gap-8">

                <span> <h2 className={`${styles.title1}`}>Charte d'utilisation de l'Application de Chat en Ligne</h2> </span>

                <span> <p className="font-bold">Nous sommes ravis de vous accueillir sur notre plateforme de chat en ligne. Pour garantir une expérience positive et 
                    respectueuse pour tous nos utilisateurs, veuillez lire attentivement cette Charte d'utilisation. En utilisant notre application, 
                    vous acceptez de vous conformer à ces règles et directives.</p> </span>

                <div className="">
                    {chart.map((element) => {
                        return (
                            <div>
                                <h2 className={`${styles.title3}`}>{element.title}</h2>
                                <ul className="list-inside list-disc">
                                    {element.content.map((line) => { return <li>{line}</li>})}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                <span> <p className="font-bold">En cas de non-respect de cette Charte, des mesures peuvent être prises, y compris la suspension ou la résiliation du compte.
                    Merci de contribuer à faire de EPI-IRC WorldWide Chat un espace accueillant et positif pour tous nos utilisateurs !</p> </span>
            </div>
        </div>
        )
    }

    const linkRegex = /(?:^|\s)((?:https?|ftp):\/\/[\w/\-?=%.]+\.[\w/\-?=%.]+)/g;

    return (
        <div className={`${styles.messageContainer}`}>
        <div className="h-full overflow-y-scroll" ref={messageScrollBox}>
            {messages && messages.map(({ message, username, time }, index) => {

                const chatTime = moment(time).format("YYYY/MM/DD HH:mm");
                const hoverTime = moment(time).format("LLLL");

                if(message.startsWith('‎')) {
                    let respondUsername = message.split(" ")[1];
                    respondUsername = respondUsername.substring(0, respondUsername.length - 1);
                    return (
                        <div className="flex flex-col mb-2" key={index}>
                            <div className="flex items-center mb-1">
                                {username && <span className="font-semibold text-slate-200 mr-2">{username}</span>}
                                <span className="text-sm text-gray-300" title={hoverTime}>{chatTime}</span>
                            </div>
                            <div 
                                className="bg-gray-600 p-2 rounded-lg" 
                                title={`Respond to ${respondUsername}`} 
                                onClick={() => {
                                    if (newMessageRef.current) {
                                        newMessageRef.current.value = `/msg ${respondUsername} `;
                                    }
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                <strong><span className="text-yellow-400">{message}</span></strong>
                            </div>
                        </div>
                    )
                }

                const isImageLink = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(message);
                const messageWithLinks = message.replace(linkRegex, (match, link) => {
                    if (isImageLink) {
                        return `<img src="${link}" class="h-48 max-h-full cursor-pointer shadow-inner hover:h-fit" alt="${link}" />`;
                    } else {
                        return `<a href="${link}" class="text-cyan-500 hover:underline underline-offset-2" target="_blank" rel="noopener noreferrer">${link}</a>`;
                    }
                });
                
                return (
                    <div className="flex flex-col mb-2" key={index}>
                        <div className="flex items-center mb-1">
                            {username && <span className="font-semibold text-slate-200 mr-2">{username}</span>}
                            <span className="text-sm text-gray-500" title={hoverTime}>{chatTime}</span>
                        </div>
                        <div className="bg-gray-200 p-2 rounded-lg">
                            <span className="text-gray-800" dangerouslySetInnerHTML={{__html: messageWithLinks}} />
                        </div>
                    </div>
                )
            })}
        </div>
            <div ref={messageEndRef} />

            <form onSubmit={handleSendMessage} className="flex gap-4 items-end">
            <input
              type="text"
              name="message"
              placeholder="Écrivez un message ici..."
              className="border p-2 rounded flex-grow"
              ref={newMessageRef}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Send
            </button>
          </form>
        </div>
    );
}

export default MessageContainer;