import "./App.css";
import "normalize.css";
import { SchemeEditor } from "./components/SchemeEditor";
import { useState } from "react";
import {
  SchemaEditorData,
  SchemaEditorNode,
  SchemeEditorConfig,
} from "./models";

function App() {
  const [config, setConfig] = useState<SchemeEditorConfig>({
    canvasPosition: { x: 100, y: 100 },
    zoom: 0.2,
  });

  const [data] = useState<SchemaEditorData>({
    nodes: [
      {
        id: "1",
        position: { x: 130, y: 120 },
        type: "simple",
      },
      {
        id: "2",
        position: { x: 340, y: -100 },
        type: "simple2",
      },
    ],
  });

  return (
    <div className="App">
      <div style={{ width: "600px", height: "600px", position: "relative" }}>
        <div style={{ fontSize: "8px" }}>{JSON.stringify(config)}</div>
        <button
          onClick={() =>
            setConfig({
              canvasPosition: { x: 200, y: 200 },
              zoom: 0.4,
            })
          }
        >
          test
        </button>
        <SchemeEditor
          config={config}
          changeConfig={(c) => setConfig((o) => ({ ...o, ...c }))}
          data={data}
        >
          {({ data }: { data: SchemaEditorNode }) => {
            return (
              <>
                {data.type === "simple" && <div>simple{data.id}</div>}
                {data.type === "simple2" && <div>simple2{data.id}</div>}
              </>
            );
          }}
        </SchemeEditor>
      </div>
    </div>
  );
}

export default App;
