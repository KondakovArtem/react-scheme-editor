import { useState, useEffect, MutableRefObject } from "react";
import type { SchemeEditorOptions } from "../models";

export interface UseDragOptions<T> extends SchemeEditorOptions {
  ref: MutableRefObject<T | null>;
}

export function useDrag<T extends HTMLElement>(options: UseDragOptions<T>) {
  const { ref } = options;
  const { canvasPosition } = options;
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseDown = (event: MouseEvent) => {
      debugger;
      if (event.target === ref.current) {
        setDragging(true);
        setOffset({
          x: event.clientX - canvasPosition.x,
          y: event.clientY - canvasPosition.y,
        });
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!dragging) return;
      setPosition({
        x: event.clientX - offset.x,
        y: event.clientY - offset.y,
      });
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    // window.add

    element.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, offset, canvasPosition]);

  return { ref, position };
}
