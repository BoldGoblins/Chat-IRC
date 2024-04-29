import React, { ReactEventHandler, useRef, useState } from "react";
import { useSockets } from "../context/socket.context";
import EVENTS from "../config/events";
import styles from "../constant/styles.js";
/*
function debug()
{
    const arr: Array<String> = [];

    for (let i = 0; i < 100; i++) 
    {
        arr.push("---- DEBUG ----");      
        arr.concat();
    }

    return (<div> {arr.map((el) => {return <h1>{el}</h1>})} </div>);
}
*/
interface ChildComponentProps {
    resetDisplay: () => void;
  }

const RoomsContainer : React.FC <ChildComponentProps> = ({resetDisplay}) => {

    const {socket, roomId, rooms } = useSockets()
    const newRoomRef = useRef<HTMLInputElement>(null);  
    const [lastClickedIndex, setLastClickedIndex] = useState(-1);

    function handleCreateRoom(){
        if(newRoomRef.current) {
            const roomName = newRoomRef.current.value || '';

            if (!String(roomName).trim()) return;
    
            socket.emit(EVENTS.CLIENT.CREATE_ROOM, { roomName });
    
            newRoomRef.current.value = "";
        }
    }

    function handleJoinRoom(room: string, index: number) {
        if(room === roomId) return;

        socket.emit(EVENTS.CLIENT.JOIN_ROOM, room);

        setLastClickedIndex(index);
        resetDisplay();
    }

    return <div className={`${styles.asideContainer}`}>
        <div className="flex flex-col gap-4">
            <span className={`${styles.titleContainer}`}> <h4 className= {`${styles.title2}`} >Create channel : </h4> </span>

            <div className={`${styles.formItem}`}>
                <input ref={newRoomRef} placeholder="Room name" className={`${styles.inputText}`}/>
                <button onClick={handleCreateRoom} className={`${styles.button}`}>Create</button>
            </div>
        </div>

        <div className="flex flex-col gap-y-4">
            <span className={`${styles.titleContainer}`}> <h4 className= {`${styles.title2}`} >Join channel : </h4> </span>

            <div className={`${styles.roomItems}`}>
                {Object.keys(rooms).map((room, index) => {
                    return (
                        <div key={room}>
                            <button disabled={room === roomId}
                            title={`Join ${(rooms[room as keyof typeof rooms] as { name: string })?.name}`}
                            onClick={(event) => handleJoinRoom(room, index)}
                            className={lastClickedIndex !== index ? `${styles.buttonRoom}`: `${styles.buttonRoomClicked}`}
                            >
                            # {(rooms[room as keyof typeof rooms] as { name: string })?.name}
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    </div>;
}

export default RoomsContainer;