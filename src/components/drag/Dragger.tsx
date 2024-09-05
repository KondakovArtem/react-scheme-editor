import {
  createContext,
  FC,
  MutableRefObject,
  PropsWithChildren,
  useRef,
  useState,
} from "react";

import { Position } from "../../models";
import { MouseTouchEvent } from "./DragItem";
import { useCanvasPositionState } from "../../context/canvasPosition.context";
import { useZoomState } from "../../context/zoom.context";

export interface IDragItem {
  dragStart?: (pos: IDraggingEvent) => void;
  dragMove?: (pos: IDraggingEvent) => void;
  dragEnd?: (pos: IDraggingEvent) => void;
}

export interface DraggerProps<T extends HTMLElement = HTMLElement>
  extends PropsWithChildren {
  /** Ссылка на DOM элемент, который будет общим контейнером для drag'n'drop */
  dragRef: MutableRefObject<T | null>;
  /** Масштаб */
  // zoom: number;
  /** Позиция canvas без учета масштаба */
  // canvasPosition: Position;
}

interface IDraggingPos {
  /** положение handler из события */
  handler: Position;
  /** относительно dragRef */
  canvas: Position;
  /** относительно dragRef в масштабе */
  scale: Position;
}

export interface IDraggingEvent {
  /** Оригинальная позиция handler на момент старта drag'n'drop */
  origin: IDraggingPos;
  /** Текущая позиция handler на момент старта drag'n'drop */
  current: IDraggingPos;
  /** Изменения позиции handler */
  dPos?: IDraggingPos;
  /** Событие */
  e: MouseTouchEvent;
  /** Масштаб */
  zoom?: number;
}

export function addCoords(coord: Position, ...args: Position[]) {
  return args.reduce((pre: Position, item, i) => {
    if (typeof item === "number") {
      item = { x: item, y: item };
    }
    return {
      x: pre.x + item.x,
      y: pre.y + item.y,
    };
  }, coord);
}

export function subCoords(coord: Position, ...args: Position[]) {
  return args.reduce((pre: Position, item, i) => {
    if (typeof item === "number") {
      item = { x: item, y: item };
    }
    return {
      x: pre.x - item.x,
      y: pre.y - item.y,
    };
  }, coord);
}

export function divCoords(coord: Position, ...args: (Position | number)[]) {
  return args.reduce((pre: Position, item, i) => {
    if (typeof item === "number") {
      item = { x: item, y: item };
    }
    return {
      x: pre.x / item.x,
      y: pre.y / item.y,
    };
  }, coord);
}

function prepareDraggingPos(
  handler: Position,
  canvasRect: DOMRect,
  canvasPosition: Position,
  zoom: number = 1
): IDraggingPos {
  return {
    handler,
    canvas: subCoords(handler, canvasRect),
    scale: subCoords(
      divCoords(subCoords(handler, canvasRect), zoom),
      divCoords(canvasPosition, zoom)
    ),
  };
}

interface IDraggerContext {
  dragStart?: (e: MouseEvent | TouchEvent, dragItem: IDragItem) => void;
}

export const DraggerContext = createContext<IDraggerContext>({});

/** Компонент предоставляет контекст для управления перетаскиванием.
 *  Он использует useRef для хранения состояния и методов, связанных с перетаскиванием
 * */
export const Dragger: FC<DraggerProps> = (props) => {
  const { dragRef, children } = props;
  const [enabled, setEnabled] = useState(false);

  const canvasPosition = useCanvasPositionState();
  const zoom = useZoomState();

  const stateRef = useRef<{
    curDragItem?: IDragItem;
    originPos?: IDraggingPos;
    enabled: boolean;
    zoom?: number;
    canvasPosition: Position;
  }>({
    curDragItem: undefined,
    originPos: undefined,
    enabled,
    zoom,
    canvasPosition,
  });
  Object.assign(stateRef.current, { zoom, canvasPosition, enabled });

  const methodRef = useRef({
    dragEndEventListener: (e: MouseTouchEvent) => {
      // e.stopPropagation();
      methodRef.current.dragEnd(e);
    },
    dragStart: (e: MouseTouchEvent, dragItem: IDragItem) => {
      // e.stopPropagation();
      const { current: state } = stateRef;
      const { zoom = 1, canvasPosition = { x: 0, y: 0 } } = state;
      const { dragEndEventListener, draggingEventListener } = methodRef.current;
      const draggerRect = dragRef.current?.getBoundingClientRect();
      if (draggerRect) {
        setEnabled(true);
        state.originPos = prepareDraggingPos(
          {
            x:
              e.type === "touchmove"
                ? (e as TouchEvent).touches[0].clientX
                : (e as MouseEvent).clientX,
            y:
              e.type === "touchmove"
                ? (e as TouchEvent).touches[0].clientY
                : (e as MouseEvent).clientY,
          },
          draggerRect,
          canvasPosition,
          zoom
        );
      }

      if (!state.curDragItem) {
        state.curDragItem = dragItem;

        window.addEventListener("mouseup", dragEndEventListener);
        window.addEventListener("mousemove", draggingEventListener);

        window.addEventListener("touchend", dragEndEventListener);
        window.addEventListener("touchmove", draggingEventListener);

        if (state.originPos) {
          dragItem.dragStart?.({
            origin: state.originPos,
            current: state.originPos,
            e,
            zoom,
          });
        }
      }
    },

    dragEvent: (e: MouseTouchEvent) => {
      const { enabled, curDragItem, originPos, zoom, canvasPosition } =
        stateRef.current;

      if (enabled && curDragItem) {
        const draggerRect = dragRef.current?.getBoundingClientRect();
        if (draggerRect && originPos) {
          const current = prepareDraggingPos(
            {
              x:
                e.type === "touchmove"
                  ? (e as TouchEvent).touches[0].clientX
                  : (e as MouseEvent).clientX,
              y:
                e.type === "touchmove"
                  ? (e as TouchEvent).touches[0].clientY
                  : (e as MouseEvent).clientY,
            },
            draggerRect,
            canvasPosition,
            zoom
          );

          return {
            e,
            current: current,
            origin: originPos as IDraggingPos,
            dPos: {
              canvas: subCoords(current.canvas, originPos.canvas),
              handler: subCoords(current.handler, originPos.handler),
              scale: subCoords(current.scale, originPos.scale),
            },
            zoom,
          };
        }
      }
    },

    dragMove: (e: MouseTouchEvent) => {
      requestAnimationFrame(() => {
        const { dragEvent } = methodRef.current;
        const { curDragItem } = stateRef.current;
        const event = dragEvent(e);
        event && curDragItem?.dragMove?.(event);
      });
    },
    dragEnd: (e: MouseTouchEvent) => {
      const { dragEvent, dragEndEventListener, draggingEventListener } =
        methodRef.current;
      const { curDragItem } = stateRef.current;
      const event = dragEvent(e);
      event && curDragItem?.dragEnd?.(event);

      setEnabled(false);
      delete stateRef.current.curDragItem;

      const el = window;
      el.removeEventListener("mouseup", dragEndEventListener);
      el.removeEventListener("mousemove", draggingEventListener);

      el.removeEventListener("touchend", dragEndEventListener);
      el.removeEventListener("touchmove", draggingEventListener);
    },
    draggingEventListener: (e: MouseEvent | TouchEvent) => {
      e.stopPropagation();
      methodRef.current.dragMove(e);
    },
  });

  const { dragStart } = methodRef.current;
  return (
    <DraggerContext.Provider value={{ dragStart }}>
      {children}
    </DraggerContext.Provider>
  );
};
