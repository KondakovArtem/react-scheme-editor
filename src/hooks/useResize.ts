import { useEffect, MutableRefObject, useRef } from "react";
import { Position, Rect } from "../models";

export interface UseResize<T = HTMLElement> {
  ref: MutableRefObject<T | null>;
  onResize?: (rect: Partial<Rect>) => void;
  position?: Position;
}

export function useResize<T extends HTMLElement>({
  ref,
  onResize,
  position,
}: UseResize<T>) {
  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;

  useEffect(() => {
    const { current: element } = ref;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      onResizeRef.current?.({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
      onResizeRef.current?.({});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  useEffect(() => {
    position && onResizeRef.current?.(position);
  }, [position]);

  return { ref };
}
