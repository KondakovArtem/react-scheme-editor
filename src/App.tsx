import { SchemaEditor } from "./components/SchemaEditor";
import { memo, useMemo, useState } from "react";
import {
  SchemaEditorData,
  SchemaEditorNode,
  SchemaEditorConfig,
} from "./models";
import "normalize.css";
import style from "./App.module.scss";

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

  const selected = useMemo(() => config?.selected, [config?.selected]);

  return (
    <div className={style.App}>
      <button onClick={() => setData({ nodes: generateNodes(1000) })}>
        Random
      </button>
      <div style={{ width: "1000px", height: "600px", position: "relative" }}>
        <div style={{ fontSize: "8px" }}>{JSON.stringify(config)}</div>
        <button onClick={() => setText(text + "bla")}>{text}</button>
        <SchemaEditor
          config={config}
          onChangeConfig={(c: Partial<SchemaEditorConfig>) =>
            setConfig((o) => ({ ...o, ...c }))
          }
          data={data}
          onSelect={(data) => setConfig((o) => ({ ...o, selected: data }))}
          // onSelect={(ids: SchemaEditorNode["id"][]) => {
          //   setData({
          //     ...data,
          //     nodes: data.nodes?.map((node) =>
          //       ids.includes(node.id)
          //         ? {
          //             ...node,
          //             position: {
          //               x: -100,
          //               y: -100,
          //             },
          //           }
          //         : node
          //     ),
          //   });
          // }}
        >
          {useMemo(
            () => (data) => {
              return (
                <SampleNode
                  data={data}
                  selected={!!selected?.includes(data.id)}
                  setText={setText}
                  text={text}
                ></SampleNode>
              );
            },
            [selected, text]
          )}
        </SchemaEditor>
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
  }: {
    data: SchemaEditorNode;
    selected?: boolean;
    text: string;
    setText(v: string): void;
  }) => {
    console.log(`render simple ${data.id}`);

    return (
      <div className={selected ? style.selected : ""}>
        <button onClick={() => setText(text + "bla")}>{text}</button>
        {/* <div>{JSON.stringify(config)}</div> */}
        {data.type === "simple" && <div>simple{data.id}</div>}
        {data.type === "simple2" && <div>simple2{data.id}</div>}
      </div>
    );
  }
);
SampleNode.displayName = "SampleNode";

export default App;
