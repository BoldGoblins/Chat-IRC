import React from 'react';
import SocketsProvider from './context/socket.context';
import ChatPage from './components/chatPage';
import ImageBackground from 'react';
import './index.css';

const App: React.FC = () => {

  return (
    <SocketsProvider>
      <div className="App h-full">
      <ChatPage />
      </div> 
    </SocketsProvider>    
  );
}

export default App;