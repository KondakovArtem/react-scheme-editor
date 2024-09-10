import {
  FC,
  memo,
  MutableRefObject,
  PropsWithChildren,
  useEffect,
  useRef,
} from "react";

import { draggerContextAtom, IDraggerContext, IDragItem } from "./Dragger";
import { debounce } from "../../utils/debounce";
import { EMouseButton, MouseTouchEvent } from "../../models";
import { useAtomValue } from "jotai";

export interface DragOptions {
  delay: number;
  button: EMouseButton[];
}

export type DragItemProps<T extends HTMLElement = HTMLElement> = IDragItem &
  PropsWithChildren & {
    itemRef: MutableRefObject<T | null>;
    delay?: number;
    dragOptions?: DragOptions;
  };

/**  Компонент, который реализует логику перетаскивания для конкретного элемента.
 *  Он использует контекст DraggerContext для взаимодействия с Dragger */
export const DragItem: FC<DragItemProps> = memo(
  ({ dragOptions, itemRef, children, dragStart, dragMove, dragEnd }) => {
    const { draggerInit } = useAtomValue(draggerContextAtom);

    const dragOptionsRef = useRef(dragOptions);
    dragOptionsRef.current = dragOptions;

    const methodRef: MutableRefObject<
      IDragItem & {
        startHandler(e: MouseTouchEvent): void;
        downItemDebounce: ReturnType<typeof debounce>;
        stopHandler(): void;
        downItem(e: MouseTouchEvent): void;
        draggerInit: IDraggerContext["draggerInit"];
      }
    > = useRef({
      dragStart,
      dragMove,
      dragEnd,
      draggerInit,
      startHandler: (e: MouseTouchEvent): void => {
        e.stopPropagation();
        e.preventDefault();
        methodRef.current.downItemDebounce?.(e);
      },
      downItemDebounce: debounce(
        (e) => methodRef.current.downItem(e),
        dragOptionsRef.current?.delay ?? 0
      ),
      stopHandler: () => methodRef.current.downItemDebounce?.cancel(),
      downItem: (e: MouseTouchEvent) => {
        const { dragStart, dragMove, dragEnd } = methodRef.current;
        const { button } = dragOptionsRef.current ?? {};
        if (!button || button.includes((e as MouseEvent).button)) {
          methodRef.current?.draggerInit?.(e, {
            dragStart,
            dragMove,
            dragEnd,
          });
        }
      },
    });
    Object.assign(methodRef.current, { draggerInit });

    const { startHandler, stopHandler } = methodRef.current;

    useEffect(() => {
      const { downItemDebounce, downItem } = methodRef.current;
      downItemDebounce?.cancel();
      methodRef.current.downItemDebounce = debounce(
        (e) => downItem(e),
        dragOptions?.delay ?? 0
      );
    }, [dragOptions?.delay]);

    useEffect(() => {
      const el = itemRef.current;
      if (!el) return;

      el.addEventListener("mousedown", startHandler);
      el.addEventListener("touchstart", startHandler);
      el.addEventListener("mouseup", stopHandler);
      const unlisteners: (() => void)[] = [
        () => el.removeEventListener("mousedown", startHandler),
        () => el.removeEventListener("touchstart", startHandler),
        () => el.removeEventListener("mouseup", stopHandler),
      ];
      return () => unlisteners.forEach((u) => u());
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemRef]);

    return <>{children}</>;
  }
);

DragItem.displayName = "DragItem";
