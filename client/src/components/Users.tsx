import React, { useEffect, useRef } from 'react';
import { useSockets } from '../context/socket.context';
import EVENTS from "../config/events";
import '../index.css';
import styles from "../constant/styles.js";
import UsersList from "./usersList";
import Login from "./login";


function UsersContainer() {
  const { socket, username, setUsername } = useSockets();
  const usernameRef = useRef<HTMLInputElement>(null);

  function handleSetUsername(){
    if (usernameRef.current) {
      const value = usernameRef.current.value;
      console.log(value);
      setUsername(value);
      localStorage.setItem("username", value);
      console.log(username);

      socket.emit(EVENTS.CLIENT.SET_USERNAME, value);
    }
  }

  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.value = localStorage.getItem("username") || "";
    }
  }, []);

  console.log(username);

  return (
      <div className={`${styles.asideContainer}`}>
        {!username && <div className={`${styles.formItem}`}>
          <span className={`${styles.titleContainer}`}> <h1 className={`${styles.title2}`}>Choose username</h1> </span>

          <input placeholder="Username" ref={usernameRef} className={`${styles.inputText}`}/>

          <button onClick={handleSetUsername} className={`${styles.button}`}>Enter</button>


          </div>}
          
        {username && <div className="flex flex-col gap-4">
        <span className={`${styles.titleContainer}`}> <h1 className={`${styles.title2}`}>Choose username</h1> </span>
        <div className="bg-slate-100 border border-black rounded-lg p-4"> 
          <p className="">You are currently logged in as <span className="font-bold">"{username}"</span>.</p> 
          <p>Use "/nick [nickname]" command in a chat to change nickname !</p> 
        </div>
          

          </div>}

        {/* <div>{//socket.id}</div>*/}

        <Login/>

        <UsersList/>

      </div>  
  );
} 

export default UsersContainer;
