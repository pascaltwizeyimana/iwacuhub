import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Override console.error to filter HMR messages
const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('HMR')) {
    return;
  }
  originalError.apply(console, args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);