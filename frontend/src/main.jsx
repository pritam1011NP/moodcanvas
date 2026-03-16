import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#221F35",
            color: "#E8E6F0",
            border: "1px solid #2E2A45",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px"
          },
          success: { iconTheme: { primary: "#10B981", secondary: "#221F35" } },
          error: { iconTheme: { primary: "#EF4444", secondary: "#221F35" } }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
