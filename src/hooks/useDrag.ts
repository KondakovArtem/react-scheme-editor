import { useState, useEffect, MutableRefObject, useRef } from "react";
import type { Position, SchemeEditorOptions } from "../models";

export interface UseDragOptions<T> extends SchemeEditorOptions {
  ref: MutableRefObject<T | null>;
  setPosition?: (position: Position) => void;
  dragCanvasClasses?: string[];
}

export function useDrag<T extends HTMLElement>(props: UseDragOptions<T>) {
  const { ref, canvasPosition = { x: 0, y: 0 }, dragCanvasClasses } = props;

  const [dragging, setDragging] = useState(false);

  const positionState = useState(canvasPosition);
  const [position, setPosition] = props.setPosition
    ? [canvasPosition, props.setPosition]
    : positionState;

  const optionsRef = useRef({ position, dragging, offset: { x: 0, y: 0 } });
  Object.assign(optionsRef.current, { position, dragging });

  const handleMouseMove = (event: MouseEvent) => {
    const {
      current: { dragging, offset },
    } = optionsRef;
    if (!dragging) return;
    const position = {
      x: event.clientX - offset.x,
      y: event.clientY - offset.y,
    };
    setPosition(position);
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (
      event.target === ref.current ||
      (dragCanvasClasses?.length &&
        dragCanvasClasses.some((cls) =>
          (event.target as HTMLElement).classList.contains(cls)
        ))
    ) {
      setDragging(true);
      optionsRef.current.offset = {
        x: event.clientX - (optionsRef.current.position?.x ?? 0),
        y: event.clientY - (optionsRef.current.position?.y ?? 0),
      };
    }
  };

  const handleMouseUp = () => {
    optionsRef.current.offset = { x: 0, y: 0 };
    setDragging(false);
  };

  useEffect(() => {
    const { current: element } = ref;
    if (!element) return;

    element.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  return { ref, position, dragging };
}
