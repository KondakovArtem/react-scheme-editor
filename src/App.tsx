import { SchemaEditor } from "./components/SchemaEditor";
import { memo, PropsWithChildren, useCallback, useMemo, useState } from "react";
import {
  SchemaEditorData,
  SchemaEditorNode,
  SchemaEditorConfig,
  SchemaEditorProps,
} from "./models";
import "normalize.css";
import "./App.scss";

function generateNodes(count: number) {
  const nodes = [];
  const types = ["simple", "simple2"];

  for (let i = 0; i < count; i++) {
    const node = {
      id: (i + 1).toString(), // Уникальный ID
      position: {
        x: Math.floor(Math.random() * 1000), // Случайное значение x
        y: Math.floor(Math.random() * 1000), // Случайное значение y
      },
      type: types[Math.floor(Math.random() * types.length)], // Случайный тип
    };

    nodes.push(node);
  }

  return nodes;
}

const nodes = generateNodes(10);

function App() {
  const [config, setConfig] = useState<SchemaEditorConfig>({
    canvasPosition: { x: 100, y: 100 },
    zoom: 0.2,
    showNavigator: false,
  });

  const [data, setData] = useState<SchemaEditorData>({
    nodes,
    /*[
      {
        id: "3",
        position: { x: 1, y: 1 },
        type: "simple2",
      },
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
    ]*/
  });

  const [text, setText] = useState("test");

  // const selected = useMemo(() => config?.selected, [config?.selected]);

  return (
    <div className="App">
      <button onClick={() => setData({ nodes: generateNodes(1000) })}>
        Random
      </button>
      <button
        onClick={() =>
          setConfig((o) => ({ ...o, showNavigator: !o.showNavigator }))
        }
      >
        Toggle Map
      </button>
      <div style={{ width: "1000px", height: "600px", position: "relative" }}>
        <div style={{ fontSize: "8px" }}>{JSON.stringify(config)}</div>
        <button onClick={() => setText(text + "bla")}>{text}</button>
        <SchemaEditor
          data={data}
          config={config}
          onChangeConfig={useCallback<
            NonNullable<SchemaEditorProps["onChangeConfig"]>
          >(
            (c: Partial<SchemaEditorConfig>) =>
              setConfig((o) => ({ ...o, ...c })),
            []
          )}
          onSelect={useCallback<NonNullable<SchemaEditorProps["onSelect"]>>(
            (selected) => setConfig((c) => ({ ...c, selected })),
            []
          )}
          onChangeData={useCallback<
            NonNullable<SchemaEditorProps["onChangeData"]>
          >((data) => {
            setData((d) => ({ ...d, ...data }));
          }, [])}
        >
          {useMemo(
            () => (data, selected) => {
              return (
                <SampleNode
                  data={data}
                  selected={!!selected}
                  setText={setText}
                  text={text}
                ></SampleNode>
              );
            },
            [text]
          )}
        </SchemaEditor>

        {/* <SchemaEditor data={data}>
          {useMemo(
            () => (data, selected) => {
              return (
                <SampleNode
                  data={data}
                  selected={!!selected}
                  setText={setText}
                  text={text}
                ></SampleNode>
              );
            },
            [text]
          )}
        </SchemaEditor> */}
      </div>
    </div>
  );
}

const SampleNode = memo(
  ({
    data,
    selected,
    text,
    setText,
    children,
  }: {
    data: SchemaEditorNode;
    selected?: boolean;
    text: string;
    setText(v: string): void;
  } & PropsWithChildren) => {
    console.log(`render simple ${data.id}`);

    return (
      <div>
        <button onClick={() => setText(text + "bla")}>{text}</button>
        {data.type === "simple" && <div>simple={data.id}</div>}
        {data.type === "simple2" && <div>simple2={data.id}</div>}
        {/* <div>sample selected={selected + ""}</div> */}
        {children}
      </div>
    );
  }
);
SampleNode.displayName = "SampleNode";

export default App;
