import { useAtomValue } from 'jotai';
import {
  FC,
  MutableRefObject,
  PropsWithChildren,
  memo,
  useEffect,
  useRef
} from 'react';

import { EMouseButton, MouseTouchEvent } from '../../models';
import { debounce } from '../../utils/debounce';

import { IDragItem, IDraggerContext, draggerContextAtom } from './Dragger';

export interface DragOptions {
  delay?: number;
  conditions?: {
    button?: EMouseButton[];
    target?: string[];
  }[];
  // button: EMouseButton[];
  // exactTarget?: boolean;
}

export type DragItemProps<T extends HTMLElement = HTMLElement> = IDragItem &
  PropsWithChildren & {
    itemRef: MutableRefObject<T | null>;
    dragOptions?: DragOptions;
  };

function checkConditions(
  conditions: DragOptions['conditions'],
  self: HTMLElement | null,
  e: MouseEvent
): DragOptions['conditions'] | null {
  if (!conditions?.length) return null;

  return conditions.filter((condition) => {
    // Проверка кнопки
    const buttonMatch =
      condition.button?.includes(e.button as EMouseButton) ?? true;

    // Проверка целевого элемента
    const targetMatch =
      condition.target?.some((target) => {
        if (target === '__self') {
          debugger;

          return e.target === self;
        }

        return (e.target as HTMLElement).classList.contains(target);
      }) ?? true;

    return buttonMatch && targetMatch;
  });
}

/**  Компонент, который реализует логику перетаскивания для конкретного элемента.
 *  Он использует контекст DraggerContext для взаимодействия с Dragger */
export const DragItem: FC<DragItemProps> = memo(
  ({ dragOptions, itemRef, children, dragStart, dragMove, dragEnd }) => {
    const { draggerInit } = useAtomValue(draggerContextAtom);

    const methodRef: MutableRefObject<
      IDragItem & {
        startHandler(e: MouseTouchEvent): void;
        downItemDebounce: ReturnType<typeof debounce>;
        stopHandler(): void;
        downItem(e: MouseTouchEvent): void;
        draggerInit: IDraggerContext['draggerInit'];
      }
    > = useRef({
      dragStart,
      dragMove,
      dragEnd,
      draggerInit,
      startHandler: (e: MouseTouchEvent): void => {
        const { conditions } = dragOptions ?? {};

        if (
          checkConditions(conditions, itemRef.current, e as MouseEvent)?.length
        ) {
          e.stopPropagation();
          e.preventDefault();
          methodRef.current.downItemDebounce?.(e);
        }
      },
      downItemDebounce: debounce(
        (e) => methodRef.current.downItem(e),
        dragOptions?.delay ?? 0
      ),
      stopHandler: () => methodRef.current.downItemDebounce?.cancel(),
      downItem: (e: MouseTouchEvent) => {
        const { dragStart, dragMove, dragEnd } = methodRef.current;
        const { conditions } = dragOptions ?? {};
        if (
          checkConditions(conditions, itemRef.current, e as MouseEvent)?.length
        ) {
          methodRef.current?.draggerInit?.(e, {
            dragStart,
            dragMove,
            dragEnd
          });
        }
      }
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
      if (!el) return undefined;

      el.addEventListener('mousedown', startHandler);
      el.addEventListener('touchstart', startHandler);
      el.addEventListener('mouseup', stopHandler);
      const unlisteners: (() => void)[] = [
        () => el.removeEventListener('mousedown', startHandler),
        () => el.removeEventListener('touchstart', startHandler),
        () => el.removeEventListener('mouseup', stopHandler)
      ];

      return () => unlisteners.forEach((u) => u());
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemRef]);

    return children;
  }
);

DragItem.displayName = 'DragItem';
