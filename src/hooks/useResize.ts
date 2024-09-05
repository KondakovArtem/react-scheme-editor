import { useEffect, MutableRefObject, useRef } from "react";

export interface UseResize<T = HTMLElement> {
  ref: MutableRefObject<T | null>;
  onResize?: (size: DOMRectReadOnly) => void;
}

export function useResize<T extends HTMLElement>({
  ref,
  onResize,
}: UseResize<T>) {
  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;

  useEffect(() => {
    const { current: element } = ref;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      onResizeRef.current?.(entry.contentRect);
    });
    observer.observe(element);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  return { ref };
}
