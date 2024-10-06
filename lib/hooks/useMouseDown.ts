import {
  useEffect,
  MutableRefObject,
  MouseEventHandler,
  useRef,
  MouseEvent,
} from "react";

export interface UseMouseDown<T = Element> {
  ref: MutableRefObject<T | null>;
  onMouseDown: MouseEventHandler;
}

export function useMouseDown<T extends Element>({
  ref,
  onMouseDown,
}: UseMouseDown<T>) {
  const callback = useRef((e: MouseEvent) => onMouseDown(e));

  useEffect(() => {
    ref.current?.addEventListener("mousedown", callback.current as any);
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ref.current?.removeEventListener("mousedown", callback.current as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}
