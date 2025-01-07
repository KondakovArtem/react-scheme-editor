import { useAtomValue } from 'jotai';
import { FC, MutableRefObject, PropsWithChildren } from 'react';

import { canvasPositionAtom } from '../context/canvasPosition.context';
import { zoomAtom } from '../context/zoom.context';
import { useZoom } from '../hooks/useZoom';
import { Position } from '../models';

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

  if (positionRef) positionRef.current = canvasPosition;

  window.requestAnimationFrame(() => {
    const { current: canvas } = canvasRef;
    const { current: drag } = dragRef;
    const { x, y } = canvasPosition;
    if (canvas)
      canvas.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) scale(${zoom})`;

    if (drag)
      Object.assign(drag.style, {
        backgroundSize: `${zoom * 25}px ${zoom * 25}px`,
        backgroundPosition: `${Math.round(x)}px ${Math.round(y)}px`
      });
  });

  return children;
};

CanvasMover.displayName = 'CanvasMover';
