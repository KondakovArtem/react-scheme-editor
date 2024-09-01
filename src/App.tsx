import React from "react";
import "./App.css";
import "normalize.css";
import { SchemeEditor } from "./components/SchemeEditor";

function App() {
  console.log('app');
  return (
    <div className="App">
      <div style={{ width: "600px", height: "600px" }}>
        <SchemeEditor></SchemeEditor>
      </div>
    </div>
  );
}

export default App;
