import { MutableRefObject, useEffect } from 'react';

export interface UseMouseDown<T = Element> {
  ref: MutableRefObject<T | null>;
  onMouseDown: EventListener;
}

export function useMouseDown<T extends Element>({
  ref,
  onMouseDown
}: UseMouseDown<T>) {
  useEffect(() => {
    const { current } = ref;

    current?.addEventListener('mousedown', onMouseDown);

    return () => {
      current?.removeEventListener('mousedown', onMouseDown);
    };
  }, [ref, onMouseDown]);
}
