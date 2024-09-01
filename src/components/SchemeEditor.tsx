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
import { SchemeEditorOptions } from "../models";

function getStyles({
  x,
  y,
  zoom,
}: {
  zoom: number;
  x: number;
  y: number;
}): CSSProperties {
  return {
    backgroundSize: `${zoom * 25}px ${zoom * 25}px`,
    backgroundPosition: `${Math.round(x)}px ${Math.round(y)}px`,
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
    [initialOptions, initialOptions.canvasPosition, initialOptions.zoom]
  );

  const { ref, position, zoom } = useCanvas<HTMLDivElement>(options);

  return (
    <div
      ref={ref}
      className="schema-editor-canvas"
      style={getStyles({ ...position, zoom })}
    >
      <div
        className="schema-editor-drag-canvas"
        style={canvasStyle({ ...position, zoom })}
      >
        <CustomEl></CustomEl>
        {children}
      </div>
    </div>
  );
};
