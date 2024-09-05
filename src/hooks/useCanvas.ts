import { useRef } from "react";

export function useCanvas<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const canvasRef = useRef<T | null>(null);

  // const { zoom, position } = useZoom({ ref, canvasRef });

  return {
    ref,
    canvasRef,
    // zoom,
    // position,
    // draggingMode: useDraggingModeState(),
  };
}
