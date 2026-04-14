/**
 * index.js — Entry point for the React application
 *
 * BEGINNER TIP:
 *   React doesn't "replace" index.html. Instead, it "mounts" into the
 *   <div id="root"> element. React takes full control of that div and
 *   updates the DOM for you from then on.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global reset so all components start from a clean slate
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // StrictMode helps find bugs during development by rendering components twice
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
