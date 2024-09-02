import {
  useEffect,
  MutableRefObject,
  useRef,
  useContext,
  MouseEvent as ReactMouseEvent,
} from "react";
import { SchemeEditorContext } from "../context/editor";
import { EDraggingMode } from "../models";

export interface UseDragOptions<T = HTMLElement> {
  ref: MutableRefObject<T | null>;
}

export function useDrag<T extends HTMLElement>({ ref }: UseDragOptions<T>) {
  const ctx = useContext(SchemeEditorContext);
  const { draggingMode, setDraggingMode, setConfig, config } = ctx ?? {};

  const { canvasPosition: position = { x: 0, y: 0 } } = config ?? {};

  const optionsRef = useRef({ position, draggingMode, offset: { x: 0, y: 0 } });
  Object.assign(optionsRef.current, { position, draggingMode });

  const handleMouseClick = (event: MouseEvent) => {
    const target = event.target;
    if (
      event.button === 0 &&
      ctx?.dragCanvasClasses?.some((cls) =>
        (target as HTMLElement).classList.contains(cls)
      )
    ) {
      debugger;
      ctx?.onSelect?.({
        event: event as unknown as ReactMouseEvent,
        id: undefined,
      });
    }
  };

  const handleMouseDown = (event: MouseEvent) => {
    const position = {
      x: event.clientX - (optionsRef.current.position?.x ?? 0),
      y: event.clientY - (optionsRef.current.position?.y ?? 0),
    };

    if (event.button === 0) {
      setDraggingMode?.(EDraggingMode.selection);

      return;
    }

    if (event.button !== 1) return;

    setDraggingMode?.(EDraggingMode.canvas);
    ctx?.onDragStart?.(event as unknown as ReactMouseEvent);
    optionsRef.current.offset = position;
  };

  const handleMouseMove = (event: MouseEvent) => {
    const {
      current: { draggingMode, offset },
    } = optionsRef;
    if (draggingMode === EDraggingMode.canvas) {
      const position = {
        x: event.clientX - offset.x,
        y: event.clientY - offset.y,
      };
      setConfig?.({ canvasPosition: position });
      ctx?.onDragMove?.(event as unknown as ReactMouseEvent);
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (optionsRef.current.draggingMode) {
      optionsRef.current.offset = { x: 0, y: 0 };
      setDraggingMode?.(undefined);
      ctx?.onDragEnd?.({
        event: event as unknown as ReactMouseEvent,
        position: optionsRef.current.position,
      });
    }
  };

  useEffect(() => {
    const { current: element } = ref;
    if (!element) return;

    element.addEventListener("mousedown", handleMouseDown);
    element.addEventListener("click", handleMouseClick);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  return { ref, position, draggingMode };
}
