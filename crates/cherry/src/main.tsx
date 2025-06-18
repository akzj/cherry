import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import SettingsPage from "./components/settings/SettingsPage.tsx";
import "./App.css";
import LoginForm from "./pages/login";
import ContactPage from "./components/ContactPage";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
      <App />
    {/* <SettingsPage /> */}
    {/* <ContactPage /> */}

  </React.StrictMode>,
);
