// src/main.jsx (or index.js)

import { StrictMode } from 'react'; // Correct import for StrictMode
import { createRoot } from 'react-dom/client'; // Correct import for React 18+
import './index.css'; // Your global application styles
import App from './App.jsx'; // Your main App component

// This is where you should import the react-pro-sidebar CSS
//import 'react-pro-sidebar/dist/styles.css'; // <--- ADD THIS LINE HERE (assuming this is the correct path)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);