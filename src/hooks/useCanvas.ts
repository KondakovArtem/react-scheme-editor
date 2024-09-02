import { useRef } from "react";
import { useDrag } from "./useDrag";
import { useZoom } from "./useZoom";

export function useCanvas<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const canvasRef = useRef<T | null>(null);

  const { zoom } = useZoom({ ref, canvasRef });
  const { position, draggingMode } = useDrag({ ref });

  return { ref, canvasRef, zoom, position, draggingMode };
}
