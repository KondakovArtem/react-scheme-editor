import React from "react";
import "./App.css";
import "normalize.css";
import { SchemeEditor } from "./components/SchemeEditor";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function App() {
  return (
    <div className="App">
      <div style={{ width: "600px", height: "600px", position: "relative" }}>
        <DndProvider backend={HTML5Backend}>
          <SchemeEditor></SchemeEditor>
        </DndProvider>
      </div>
    </div>
  );
}

export default App;
