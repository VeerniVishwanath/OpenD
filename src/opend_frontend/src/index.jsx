import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import { Principal } from "@dfinity/principal";

const CURRENT_USER_ID = Principal.fromText("2vxsx-fae");
export default CURRENT_USER_ID;

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

const init = async () => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

init();
