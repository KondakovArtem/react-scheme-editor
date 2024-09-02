import { useEffect, MutableRefObject, useRef, useContext } from "react";
import { Position } from "../models";
import { SchemeEditorContext } from "../context/editor";

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
  const { config, setZoom } = useContext(SchemeEditorContext) ?? {};
  const { zoom = 1, canvasPosition: position = { x: 0, y: 0 } } = config ?? {};

  const optionsRef = useRef({ position, zoom });
  Object.assign(optionsRef.current, { position, zoom });

  function getCanvasBox(): DOMRect {
    return ref.current?.getBoundingClientRect() as DOMRect;
  }

  const zoomRef = useRef(zoom);

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  function zoomIn(pos?: Position): void {
    const { current: options } = optionsRef;
    const { zoomMax, zoomStep } = settings;
    if (options.zoom < zoomMax) {
      zoomUpdate(Math.min(zoomMax, options.zoom + zoomStep), pos);
    }
  }

  function zoomOut(pos?: Position): void {
    const { current: options } = optionsRef;
    const { zoomMin, zoomStep } = settings;
    if (options.zoom > zoomMin) {
      zoomUpdate(Math.max(zoomMin, options.zoom - zoomStep), pos);
    }
  }

  function zoomUpdate(newZoom: number, pos?: Position): void {
    const { current: options } = optionsRef;
    // this.canvasIsZoomingSubject.next(true);
    const box = getCanvasBox();
    if (!pos) {
      pos = {
        x: box.width / 2,
        y: box.height / 2,
      };
    }
    const zoomK = newZoom / options.zoom;
    setZoom?.({
      zoom: newZoom,
      canvasPosition: {
        x: ((options.position?.x ?? 0) - pos.x) * zoomK + pos.x,
        y: ((options.position?.y ?? 0) - pos.y) * zoomK + pos.y,
      },
    });
  }

  const zoomByWheelEvent = (event: WheelEvent) => {
    if (event.ctrlKey) {
      event.preventDefault();
      const canvasBox = getCanvasBox();
      if (canvasBox) {
        const pos = {
          x: event.clientX - canvasBox.x,
          y: event.clientY - canvasBox.y,
        };
        event.deltaY > 0 ? zoomOut(pos) : zoomIn(pos);
      }
    }
  };

  useEffect(() => {
    const { current: element } = ref ?? {};
    if (!element) return;
    element.addEventListener("wheel", (event) => zoomByWheelEvent(event));
    return () => {
      element.removeEventListener("wheel", (event) => zoomByWheelEvent(event));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  return {
    ref,
    ...optionsRef.current,
  };
}
