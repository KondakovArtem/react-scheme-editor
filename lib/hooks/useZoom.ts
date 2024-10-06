import { useEffect, MutableRefObject, useRef } from "react";

import { Position } from "../models";
import { methodsAtom } from "../context/methods.context";

import { useAtomValue } from "jotai";

import { canvasPositionAtom } from "../context/canvasPosition.context";
import { zoomAtom } from "../context/zoom.context";

export const settings = {
  zoomMin: 0.2,
  zoomMax: 2,
  zoomStep: 0.2,
  canvasDragMode: false,
  showMap: true,
};

interface UseZoomOptions<T> {
  ref: MutableRefObject<T | null>;
  canvasRef?: MutableRefObject<T | null>;
}

export function useZoom<T extends HTMLElement>({
  canvasRef,
  ref,
}: UseZoomOptions<T>) {
  const { onChangeConfig } = useAtomValue(methodsAtom) ?? {};

  const zoom = useAtomValue(zoomAtom);
  const position = useAtomValue(canvasPositionAtom);

  const optionsRef = useRef({ position, zoom });
  Object.assign(optionsRef.current, { position, zoom });

  function getCanvasBox(): DOMRect {
    return ref.current?.getBoundingClientRect() as DOMRect;
  }

  const zoomRef = useRef(zoom);
  if (zoomRef.current !== zoom) {
    zoomRef.current = zoom;
    const canvas = canvasRef?.current;
    const container = ref?.current;
    if (canvas && container) {
      const clearTransition = () => {
        canvas.style.transition = "";
        container.style.transition = "";
      };
      Object.assign(container.style, {
        transition: ".2s",
        transitionProperty: "background-size, background-position",
      });
      Object.assign(canvas.style, {
        transition: ".2s",
        transitionProperty: "transform",
      });

      canvas.addEventListener("transitionend", () => {
        clearTransition();
        canvas.removeEventListener("transitionend", clearTransition);
      });
    }
  }

  const methodsRef = useRef({
    zoomIn: (pos?: Position): void => {
      const { current: options } = optionsRef;
      const { zoomMax, zoomStep } = settings;
      if (options.zoom < zoomMax) {
        methodsRef.current.zoomUpdate(
          Math.min(zoomMax, options.zoom + zoomStep),
          pos
        );
      }
    },
    zoomOut: (pos?: Position): void => {
      const { current: options } = optionsRef;
      const { zoomMin, zoomStep } = settings;
      if (options.zoom > zoomMin) {
        methodsRef.current.zoomUpdate(
          Math.max(zoomMin, options.zoom - zoomStep),
          pos
        );
      }
    },
    zoomUpdate: (newZoom: number, pos?: Position): void => {
      const { current: options } = optionsRef;
      const box = getCanvasBox();
      if (!pos) {
        pos = {
          x: box.width / 2,
          y: box.height / 2,
        };
      }
      const zoomK = newZoom / options.zoom;
      methodsRef.current.onChangeConfig?.({
        zoom: newZoom,
        canvasPosition: {
          x: Math.round(((options.position?.x ?? 0) - pos.x) * zoomK + pos.x),
          y: Math.round(((options.position?.y ?? 0) - pos.y) * zoomK + pos.y),
        },
      });
    },
    zoomByWheelEvent: (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
        const canvasBox = getCanvasBox();
        if (canvasBox) {
          const pos = {
            x: event.clientX - canvasBox.x,
            y: event.clientY - canvasBox.y,
          };
          event.deltaY > 0
            ? methodsRef.current.zoomOut(pos)
            : methodsRef.current.zoomIn(pos);
        }
      }
    },
    onChangeConfig,
  });
  Object.assign(methodsRef.current, { onChangeConfig });

  useEffect(() => {
    const { current: element } = ref ?? {};
    if (!element) return;
    element.addEventListener("wheel", methodsRef.current.zoomByWheelEvent);
    return () =>
      // eslint-disable-next-line react-hooks/exhaustive-deps
      element.removeEventListener("wheel", methodsRef.current.zoomByWheelEvent);
  }, [ref]);

  return {
    ref,
    ...optionsRef.current,
  };
}
