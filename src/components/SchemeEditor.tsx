import React, {
  CSSProperties,
  FC,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import "./SchemeEditor.css";
import { useCanvas } from "../hooks/userCanvas";
import { CustomEl } from "./CustomEl";
import { Position, SchemeEditorOptions } from "../models";

function getStyles({
  x = 0,
  y = 0,
  zoom = 1,
  dragging,
}: Partial<Position & { zoom: number; dragging: boolean }>): CSSProperties {
  return {
    backgroundSize: `${zoom * 25}px ${zoom * 25}px`,
    backgroundPosition: `${Math.round(x)}px ${Math.round(y)}px`,
    border: dragging ? "1px solid black" : "",
  };
}

function canvasStyle({ x, y, zoom }: any) {
  return {
    transform: `translate(${Math.round(x)}px, ${Math.round(
      y
    )}px) scale(${zoom})`,
  };
}

export const SchemeEditor: FC<PropsWithChildren<SchemeEditorOptions>> = (
  props
) => {
  const { children, ...initialOptions } = props;
  const [options, setOptions] = useState<SchemeEditorOptions>(initialOptions);

  useEffect(
    () => setOptions(initialOptions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialOptions.canvasPosition, initialOptions.zoom]
  );

  function onZooming() {
    debugger;
  }

  const { ref, position, zoom, dragging } = useCanvas<HTMLDivElement>({
    ...options,
    onZooming,
    dragCanvasClasses: ["schema-editor-canvas", "schema-editor-drag-canvas"],
  });
  return (
    <div
      ref={ref}
      className="schema-editor-canvas"
      style={getStyles({ ...position, zoom, dragging })}
    >
      <div
        className="schema-editor-drag-canvas"
        style={canvasStyle({ ...position, zoom, dragging })}
      >
        <CustomEl></CustomEl>
        {children}
        {JSON.stringify({ position, zoom })}
      </div>
    </div>
  );
};
