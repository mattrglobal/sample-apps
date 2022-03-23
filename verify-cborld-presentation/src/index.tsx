import dotenv from "dotenv";
import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

dotenv.config();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
