import { CSSProperties, FC } from "react";

import { useCanvas } from "../hooks/useCanvas";
import {
  EDraggingMode,
  Position,
  SchemaEditorData,
  SchemeEditorConfig,
} from "../models";
import { SchemeNode } from "./SchemeNode";
import "./SchemeEditor.css";
import { SelectionBox } from "./SelectionBox";

function getStyles({
  x = 0,
  y = 0,
  zoom = 1,
  draggingMode,
}: Partial<
  Position & { zoom: number; draggingMode: EDraggingMode }
>): CSSProperties {
  return {
    backgroundSize: `${zoom * 25}px ${zoom * 25}px`,
    backgroundPosition: `${Math.round(x)}px ${Math.round(y)}px`,
    border: draggingMode !== undefined ? "1px solid black" : "",
  };
}

function canvasStyle({ x, y, zoom }: any) {
  return {
    transform: `translate(${Math.round(x)}px, ${Math.round(
      y
    )}px) scale(${zoom})`,
  };
}

interface SchemeEditorCanvasProps {
  config?: SchemeEditorConfig;
  data?: SchemaEditorData;
}

export const SchemeEditorCanvas: FC<SchemeEditorCanvasProps> = (props) => {
  const { data } = props;

  const { ref, canvasRef, position, zoom, draggingMode } =
    useCanvas<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className="schema-editor-canvas"
      style={getStyles({ ...position, zoom, draggingMode })}
    >
      <div
        ref={canvasRef}
        className="schema-editor-drag-canvas"
        style={canvasStyle({ ...position, zoom, draggingMode })}
      >
        {(data?.nodes ?? []).map((node) => (
          <SchemeNode key={node.id} data={node}></SchemeNode>
        ))}
      </div>
      <SelectionBox></SelectionBox>
    </div>
  );
};
