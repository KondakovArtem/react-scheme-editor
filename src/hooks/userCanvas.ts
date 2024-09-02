import { useEffect, useRef, useState } from "react";
import { useDrag } from "./useDrag";
import { useZoom } from "./useZoom";
import { Position, SchemeEditorOptions } from "../models";

interface UseCanvasProps extends SchemeEditorOptions {
  dragCanvasClasses?: string[];
  onZooming?: () => void;
}

export function useCanvas<T extends HTMLElement>(props: UseCanvasProps) {
  const [options, setOptions] = useState({
    canvasPosition: { x: 0, y: 0 },
    zoom: 1,
    ...props,
  });
  const ref = useRef<T | null>(null);

  const setZoom = (zoom: number) => setOptions((o) => ({ ...o, zoom }));
  const setPosition = (canvasPosition: Position) =>
    setOptions((o) => ({ ...o, canvasPosition }));

  const { zoom, position: zoomPosition } = useZoom({
    ...options,
    ref,
    setZoom,
    setPosition,
  });
  const { position, dragging } = useDrag({
    ...options,
    ref,
    setPosition,
    canvasPosition: zoomPosition,
  });

  useEffect(
    () =>
      setOptions((o) => {
        return { ...o, canvasPosition: position, zoom };
      }),
    [position.x, position.y, zoom]
  );

  return { ref, zoom, position, dragging };
}
