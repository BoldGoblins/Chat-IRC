const start = require("./server");

const server = start(3000);
import React from 'react';
import ReactDOM from 'react-dom';
import './tailwind.css'; // Import Tailwind CSS styles
import App from './App'; // Import your main application component

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
