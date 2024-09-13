import {
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Position, SchemaEditorNodeSlot, TRect } from "../../models";
import { useResize } from "../../hooks/useResize";
import { NodeRects, updateRectsAtom } from "../../context/rects.context";
import { isEmpty } from "../../utils/isEmpty";
import { useAtomValue, useSetAtom } from "jotai";
import { NodePositionContext } from "../node/SchemaNode";
import { zoomAtom } from "../../context/zoom.context";
import { useEffectDebounce } from "../../hooks/useEffectDebounce";

import "./Slot.scss";

import { useSlotPosition } from "../../hooks/usePosition";

export const Slot: FC<PropsWithChildren<{ data: SchemaEditorNodeSlot }>> = ({
  data,
  children,
}) => {
  const { id } = data;
  const ref = useRef<HTMLDivElement | null>(null);
  const updateRects = useSetAtom(updateRectsAtom);
  const { id: nodeId, ref: nodeRef } = useContext(NodePositionContext) ?? {};

  const nodePosition = useSlotPosition(nodeId as string, "all");

  const zoom = useAtomValue(zoomAtom);
  const [zoomDelay, setZoomDelay] = useState(zoom);
  useEffectDebounce(
    () => {
      setZoomDelay(zoom);
    },
    500,
    [zoom]
  );
  const [position, setPosition] = useState<Position | undefined>(nodePosition);

  useEffect(() => {
    const box = ref.current?.getBoundingClientRect();
    const nodeBox = nodeRef?.current?.getBoundingClientRect();
    if (!box || !nodeBox || !nodePosition) {
      return undefined;
    }
    setPosition({
      x: (box.x - nodeBox.x) / zoomDelay + nodePosition.x,
      y: (box.y - nodeBox.y) / zoomDelay + nodePosition.y,
    });
  }, [nodePosition, ref, nodeRef, zoomDelay]);

  useResize({
    ref,
    onResize: useCallback(
      ({ width, height, x, y }: Partial<TRect>) => {
        const newRect: Partial<TRect> = {};
        if (x !== undefined) newRect.x = x;
        if (y !== undefined) newRect.y = y;
        if (width !== undefined) newRect.width = width;
        if (height !== undefined) newRect.height = height;
        if (!isEmpty(newRect)) {
          const newRects = {
            [id]: isEmpty(newRect) ? undefined : newRect,
          } as NodeRects;
        //   console.log("slot=", newRects);
          updateRects?.(newRects);
        }
      },
      [id, updateRects]
    ),
    position,
  });

  return (
    <div ref={ref} className="schema-editor__slot">
      {children}
    </div>
  );
};
