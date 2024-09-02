import { FC, useEffect, useState } from "react";
import "./SchemeEditor.css";

import { EDraggingMode, SchemaEditorNode, SchemeEditorProps } from "../models";

import { SchemeEditorContext } from "../context/editor";
import { SchemeEditorCanvas } from "./SchemeEditorCanvas";

export const SchemeEditor: FC<SchemeEditorProps> = (props) => {
  const { changeConfig, children } = props;

  const [draggingMode, setDraggingMode] = useState<EDraggingMode | undefined>(
    undefined
  );
  const [config, setConfig] = useState(props.config);
  useEffect(() => setConfig(props.config), [props.config]);

  return (
    <SchemeEditorContext.Provider
      value={{
        draggingMode,
        setDraggingMode,
        config,
        setConfig: (c) => setConfig((o) => ({ ...o, ...c })),
        onSelect: ({ id, event }) => {
          let newSelected: SchemaEditorNode["id"][] = [];
          if (id === undefined) {
            changeConfig?.({ selected: newSelected });
            return;
          }
          const selected = props.config?.selected ?? [];

          if (event.ctrlKey) {
            newSelected = selected.includes(id)
              ? selected.filter((i) => i !== id)
              : [...selected, id];
          } else {
            newSelected = [id];
          }
          changeConfig?.({ selected: newSelected });
        },
        onDragEnd: ({ position: canvasPosition }) =>
          changeConfig?.({ canvasPosition }),
        setZoom: (data) => changeConfig?.(data),
        dragCanvasClasses: [
          "schema-editor-canvas",
          "schema-editor-drag-canvas",
        ],
        NodeTemplate: children,
      }}
    >
      <div>dragging = {draggingMode + ""}</div>
      <SchemeEditorCanvas
        data={props.data}
        config={config}
      ></SchemeEditorCanvas>
    </SchemeEditorContext.Provider>
  );
};
