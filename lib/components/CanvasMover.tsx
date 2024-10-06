import { FC, MutableRefObject, PropsWithChildren } from "react";
import { canvasPositionAtom } from "../context/canvasPosition.context";

import { Position } from "../models";
import { useZoom } from "../hooks/useZoom";
import { useAtomValue } from "jotai";
import { zoomAtom } from "../context/zoom.context";

export const CanvasMover: FC<
  PropsWithChildren<{
    canvasRef: MutableRefObject<HTMLDivElement | null>;
    dragRef: MutableRefObject<HTMLDivElement | null>;
    positionRef?: MutableRefObject<Position | undefined>;
  }>
> = ({ children, canvasRef, dragRef, positionRef }) => {
  const canvasPosition = useAtomValue(canvasPositionAtom);
  const zoom = useAtomValue(zoomAtom);

  useZoom({ ref: dragRef, canvasRef });

  positionRef && (positionRef.current = canvasPosition);

  requestAnimationFrame(() => {
    const { current: canvas } = canvasRef;
    const { current: drag } = dragRef;
    const { x, y } = canvasPosition;
    canvas &&
      (canvas.style.transform = `translate(${Math.round(x)}px, ${Math.round(
        y
      )}px) scale(${zoom})`);

    drag &&
      Object.assign(drag.style, {
        backgroundSize: `${zoom * 25}px ${zoom * 25}px`,
        backgroundPosition: `${Math.round(x)}px ${Math.round(y)}px`,
      });
  });

  return <>{children}</>;
};

CanvasMover.displayName = "CanvasMover";
