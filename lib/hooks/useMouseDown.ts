import {
  MouseEvent,
  MouseEventHandler,
  MutableRefObject,
  useEffect,
  useRef
} from 'react';

export interface UseMouseDown<T = Element> {
  ref: MutableRefObject<T | null>;
  onMouseDown: MouseEventHandler;
}

export function useMouseDown<T extends Element>({
  ref,
  onMouseDown
}: UseMouseDown<T>) {
  const callback = useRef((e: MouseEvent) => onMouseDown(e));

  useEffect(() => {
    const { current } = ref;
    current?.addEventListener('mousedown', callback.current as any);

    return () => {
      current?.removeEventListener('mousedown', callback.current as any);
    };
  }, [ref]);
}
