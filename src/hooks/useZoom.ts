import { useState, useEffect, MutableRefObject, useRef } from "react";
import { Position, SchemeEditorOptions } from "../models";

export const settings = {
  zoomMin: 0.2,
  zoomMax: 2,
  zoomStep: 0.2,
  //zoom: 1,
  canvasPosition: {
    x: 0,
    y: 0,
  },
  canvasDragMode: false,
  showMap: true,
};

interface UseZoomOptions<T> extends SchemeEditorOptions {
  ref: MutableRefObject<T | null>;
  onZooming?: () => void;
  setZoom?: (zoom: number) => void;
  setPosition?: (pos: Position) => void;
}

export function useZoom<T extends HTMLElement>(props: UseZoomOptions<T>) {
  const { ref, canvasPosition = { x: 0, y: 0 } } = props;
  const zoomState = useState(props.zoom ?? 1);
  const positionState = useState(canvasPosition ?? { x: 0, y: 0 });

  const [zoom, setZoom] = props.setZoom
    ? [props.zoom ?? 1, props.setZoom]
    : zoomState;

  const [position, setPosition] = props.setPosition
    ? [canvasPosition ?? { x: 0, y: 0 }, props.setPosition]
    : positionState;

  const optionsRef = useRef({ position, zoom });
  Object.assign(optionsRef.current, { position, zoom });

  function getCanvasBox(): DOMRect {
    return ref.current?.getBoundingClientRect() as DOMRect;
  }

  useEffect(() => {
    const { current: options } = optionsRef;
    if (options.zoom !== zoom) {
      props.onZooming?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, props.onZooming]);

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
    setZoom(newZoom);

    setPosition({
      x: ((options.position?.x ?? 0) - pos.x) * zoomK + pos.x,
      y: ((options.position?.y ?? 0) - pos.y) * zoomK + pos.y,
    });

    // this.dragCanvas.nativeElement.style.transition = "0.2s";
    // this.updateSettings({
    //   canvasPosition: canvasPos,
    //   zoom,
    // });
  }

  const zoomByWheelEvent = (event: WheelEvent) => {
    const canvasBox = getCanvasBox();
    if (canvasBox) {
      const pos = {
        x: event.clientX - canvasBox.x,
        y: event.clientY - canvasBox.y,
      };
      if (event.deltaY > 0) {
        zoomIn(pos);
      } else {
        zoomOut(pos);
      }
    }
  };

  useEffect(() => {
    const { current: element } = ref;
    if (!element) return;
    element.addEventListener("wheel", (event) => zoomByWheelEvent(event));
    return () => {
      element.removeEventListener("wheel", (event) => zoomByWheelEvent(event));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
  // console.log("optionsRef.current.zoom=", optionsRef.current.zoom);
  // console.log("optionsRef.current.position=", optionsRef.current.position);
  return {
    ref,
    ...optionsRef.current,
  };
}
