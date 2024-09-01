import { useState, useEffect, MutableRefObject, useCallback } from "react";

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

interface Position {
  x: number;
  y: number;
}

export function useZoom<T extends HTMLElement>(
  ref: MutableRefObject<T | null>,
  position: Position
) {
  const [zoom, setZoom] = useState(1);
  //   const [zooming, setZooming] = useState(false);

  // useEffect(() => {
  //     if ()
  // }, [zooming])

  const zoomByWheelEvent = useCallback(
    (event: WheelEvent) => {
      debugger;

      function getCanvasBox(): DOMRect {
        return ref.current?.getBoundingClientRect() as DOMRect;
      }

      function zoomIn(pos?: Position): void {
        const { zoomMax, zoomStep } = settings;
        if (zoom < zoomMax) {
          const newZoom = Math.min(zoomMax, zoom + zoomStep);
          zoomUpdate(newZoom, pos);
        }
      }

      function zoomOut(pos?: Position): void {
        const { zoomMin, zoomStep } = settings;
        if (zoom > zoomMin) {
          const newZoom = Math.max(zoomMin, zoom - zoomStep);
          zoomUpdate(newZoom, pos);
        }
      }

      function zoomUpdate(newZoom: number, pos?: Position): void {
        // this.canvasIsZoomingSubject.next(true);
        const box = getCanvasBox();
        if (!pos) {
          pos = {
            x: box.width / 2,
            y: box.height / 2,
          };
        }
        const zoomK = newZoom / zoom;
        setZoom(newZoom);
        const canvasPos = {
          x: (position.x - pos.x) * zoomK + pos.x,
          y: (position.y - pos.y) * zoomK + pos.y,
        };
        // this.dragCanvas.nativeElement.style.transition = "0.2s";
        // this.updateSettings({
        //   canvasPosition: canvasPos,
        //   zoom,
        // });
      }

      const canvasBox = ref.current?.getBoundingClientRect();
      if (canvasBox) {
        const pos = {
          x: event.clientX - canvasBox.x,
          y: event.clientY - canvasBox.y,
        };
        if (event.deltaY > 0) {
          zoomOut(pos);
        } else {
          zoomIn(pos);
        }
      }
    },
    [ref, zoom]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.addEventListener("wheel", zoomByWheelEvent);
    return () => {
      element.removeEventListener("wheel", zoomByWheelEvent);
    };
  }, [zoom, ref]);

  return { ref, zoom };
}
