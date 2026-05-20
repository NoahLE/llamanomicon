import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { enableMapSet } from "immer";

import "intro.js/introjs.css";
import "@/main.css";
import App from "@/App";

enableMapSet();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
