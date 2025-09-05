// React entrypoint: bootstraps the app and global styles
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // global styles and layout

// Mount the React app into the #root element
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
