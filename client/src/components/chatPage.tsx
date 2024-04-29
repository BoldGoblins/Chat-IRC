import React, { useState, useRef, useEffect } from 'react';

import MessageContainer from './Messages';
import RoomsContainer from './Rooms';
import UsersContainer from './Users';
import styles from "../constant/styles";

function ChatPage() {
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [indiceElement, setElementDisplayed] = useState <number> (1);
  const [isMobile, setIsMobile] = useState(false);
  const roomsPageRef = useRef(null);
  const usersPageRef = useRef(null);
  const elementDisplayed = ["rooms", "messages", "users"];

  const resetElementDisplayed = () => {
    setElementDisplayed(1);

  };
  const handleWindowSizeChange = () => {

    const mediaQuery = window.matchMedia('(max-width: 1024px)');
    setIsMobile(mediaQuery.matches);
  };

  // Update of isMobile useState
  useEffect(() => {
    // Initial check when the component mounts
    handleWindowSizeChange();

    // Add event listener for changes in viewport size
    window.addEventListener('resize', handleWindowSizeChange);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []); 
  

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const messageInput = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
    const message = messageInput.value;
    setMessageHistory(prevHistory => [...prevHistory, message]);
    messageInput.value = ''; // Reset the input field
  };

  const handleLoginClick = () => {
    
    window.location.href="http://localhost:3000/login";
  };

  const leftArrow = () => {
    setElementDisplayed(indiceElement === 0 ? 0 : indiceElement - 1);
  };

  const rightArrow = () => {
    setElementDisplayed(indiceElement === 2 ? 2 : indiceElement + 1);
  };

  return (
    <div className="">
      <div className="w-full h-[100px] block lg:hidden">
        <div className="flex flex-row items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 gap-x-16 rounded-lg w-full h-[100px] px-12 fixed top-0">
          <button className={`${styles.navButton}`} onClick={leftArrow}> <img src="/arrow.png" className={`${styles.navImage}`} /> </button>
          <button className={`${styles.navButton}`} onClick={rightArrow}> <img src="/arrow.png" className={`${styles.navImage} rotate-180`} /> </button>
        </div>
      </div>

      <div className="flex flex-row p-4 lg:mx-auto gap-2 justify-stretch h-[1080px] max-w-[1920px]">
        
        {/* Left column (Options) */}
        <div ref= {roomsPageRef} className={elementDisplayed[indiceElement] === "rooms" && isMobile ? "w-full" : `w-full lg:w-3/12 hidden lg:block`}>
          <RoomsContainer resetDisplay= {resetElementDisplayed}/>
        </div>

        {/* Middle column (Main chat area) */}
        <div className={elementDisplayed[indiceElement] === "messages" || !isMobile ? "w-full" : "w-full lg:w-6/12 hidden"}>
          <MessageContainer/>
        </div>

        {/* Right column (Login component or additional content) */}
        <div ref={usersPageRef} className={elementDisplayed[indiceElement] === "users" && isMobile ? "w-full" : "w-full lg:w-3/12 hidden lg:block"}>
          <UsersContainer/>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;


/*
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={handleLoginClick}>
          Login
        </button>

        style={{ background: "url('/background.jpeg')" }}
*/
