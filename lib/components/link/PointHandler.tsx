import { FC, memo, MouseEventHandler, useMemo, useRef } from "react";
import {
  EDraggingMode,
  EMouseButton,
  ESchemaEditorLinkModels,
  Position,
  SlotRect,
} from "../../models";

import { DragItem, DragOptions } from "../drag/DragItem";
import { useSetAtom } from "jotai";
import { dragginModeAtom } from "../../context/draggingMode.context";
import { IDraggingEvent } from "../drag/Dragger";

import {
  clearDragPointerAtom,
  updateDragPointerAtom,
} from "../../context/dragNodePosition.context";
import { linkModels } from "./helpers";
import { updateLinkPointsAtom } from "../../context/data.context";

interface PointHandlerProps {
  pointIndex: number;
  linkId: string;
  linkModel: ESchemaEditorLinkModels;
  points: Position[];
  from: SlotRect;
  to: SlotRect;
  onMouseOut?: MouseEventHandler;
  onMouseOver?: MouseEventHandler;
}

const DRAG_OPTIONS: DragOptions = {
  button: [EMouseButton.left],
};

function getPointStyle(point: Position) {
  return {
    transform: `translate(${Math.round(point.x)}px, ${Math.round(point.y)}px)`,
    transformOrigin: "center center",
  };
}

export const PointHandler: FC<PointHandlerProps> = memo(
  ({
    pointIndex,
    linkId,
    linkModel,
    points,
    from,
    to,
    onMouseOut,
    onMouseOver,
  }) => {
    const pointRef = useRef<HTMLDivElement | null>(null);
    const point = points[pointIndex];
    const setDraggingMode = useSetAtom(dragginModeAtom);
    const updateDragPointer = useSetAtom(updateDragPointerAtom);
    const clearDragPointer = useSetAtom(clearDragPointerAtom);
    const updateLinkPoints = useSetAtom(updateLinkPointsAtom);

    const stateRef = useRef({
      originPoint: undefined as Position | undefined,
      point,
      pointIndex,
      linkId,
      linkModel,
      from,
      to,
    });
    Object.assign(stateRef.current, { pointIndex, linkId, from, to, point });

    const methodsRef = useRef({
      pointDragStart: (event: IDraggingEvent) => {
        setDraggingMode(EDraggingMode.point);
        stateRef.current.originPoint = stateRef.current.point;
      },
      pointDragging: (event: IDraggingEvent) => {
        const { pointIndex, linkId, linkModel, from, to, originPoint } =
          stateRef.current;

        const dragPoints =
          linkModels[linkModel]?.onDrag({
            event,
            pointIndex,
            points,
            from,
            to,
            originPoint: originPoint as Position,
          }) ?? [];

        updateDragPointer({ [linkId]: dragPoints });
      },
      pointDragEnd: (event: IDraggingEvent) => {
        setTimeout(() => setDraggingMode(EDraggingMode.none));
        updateLinkPoints();
        clearDragPointer();
      },
    });

    const { pointDragStart, pointDragging, pointDragEnd } = methodsRef.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const style = useMemo(() => getPointStyle(point), [point?.x, point?.y]);
    return (
      <>
        <DragItem
          itemRef={pointRef}
          dragStart={pointDragStart}
          dragMove={pointDragging}
          dragEnd={pointDragEnd}
          dragOptions={DRAG_OPTIONS}
        ></DragItem>
        <div
          ref={pointRef}
          style={style}
          className="schema-editor__point-handler"
          onMouseOut={onMouseOut}
          onMouseOver={onMouseOver}
        >
          <span style={{ fontSize: "8px" }}>
            {JSON.stringify([Math.round(point.x), Math.round(point.y)])}
          </span>
        </div>
      </>
    );
  }
);

PointHandler.displayName = "PointHandler";
