import { FC, memo, useContext, useRef } from "react";

import styles from "./SchemaEditor.module.scss";
import { useCanvas } from "../hooks/useCanvas";
import {
  EDraggingMode,
  Position,
  SchemaEditorData,
  SchemaEditorNode,
} from "../models";
import { SchemaNode } from "./node/SchemaNode";
import { SelectionBox } from "./selectionbox/SelectionBox";
import { Navigator } from "./navigator/Navigator";
import { Dragger } from "./drag/Dragger";
import { DragItem, DragItemProps, DragOptions } from "./drag/DragItem";
import { SchemaEditorMethodsContext } from "../context/editor.methods.context";
import { useCanvasPositionDispatch } from "../context/canvasPosition.context";
import { useDraggingModeDispatch } from "../context/draggingMode.context";
import { CanvasMover } from "./CanvasMover";
import { useResize } from "../hooks/useResize";
import { useCanvasSizeDispatch } from "../context/canvasSize.context";
import { useSelectedNodeDispatch } from "../context/selected.context";

interface SchemaEditorCanvasProps {
  data?: SchemaEditorData;
  children: FC<SchemaEditorNode>;
}

const DRAG_CANVAS_OPTIONS: DragOptions = {
  button: 1,
  delay: 100,
};

export const SchemaEditorCanvas: FC<SchemaEditorCanvasProps> = memo((props) => {
  const { data, children } = props;

  const { ref, canvasRef } = useCanvas<HTMLDivElement>();

  useResize({ ref, onResize: useCanvasSizeDispatch() });

  const setCanvasPosition = useCanvasPositionDispatch();
  // const draggingMode = useDraggingModeState();
  const setDraggingMode = useDraggingModeDispatch();
  const { onChangeConfig } = useContext(SchemaEditorMethodsContext) ?? {};

  const positionRef = useRef<Position>();

  const stateRef = useRef<{
    originCanvasPos?: Position;
    onStartDragCanvas: DragItemProps["dragStart"];
    onDraggingCanvas: DragItemProps["dragMove"];
    onEndDragCanvas: DragItemProps["dragEnd"];
  }>({
    originCanvasPos: undefined,
    onStartDragCanvas: (e) => {
      setDraggingMode(EDraggingMode.canvas);
      stateRef.current.originCanvasPos = positionRef.current; // stateRef.current.position;
    },
    onDraggingCanvas: (e) => {
      const { originCanvasPos } = stateRef.current;
      if (originCanvasPos) {
        const canvasPosition = {
          x: originCanvasPos.x + (e.dPos?.canvas?.x ?? 0),
          y: originCanvasPos.y + (e.dPos?.canvas?.y ?? 0),
        };
        setCanvasPosition(canvasPosition);
      }
    },
    onEndDragCanvas: (e) => {
      const { originCanvasPos } = stateRef.current;
      if (originCanvasPos) {
        delete stateRef.current.originCanvasPos;
        setDraggingMode(EDraggingMode.none);
        onChangeConfig?.({
          canvasPosition: {
            x: originCanvasPos.x + (e.dPos?.canvas?.x ?? 0),
            y: originCanvasPos.y + (e.dPos?.canvas?.y ?? 0),
          },
        });
      }
    },
  });

  const { onDraggingCanvas, onEndDragCanvas, onStartDragCanvas } =
    stateRef.current;

  const onSelect = useSelectedNodeDispatch();

  return (
    <Dragger dragRef={ref}>
      {/* <div>{JSON.stringify(position)}</div> */}
      <DragItem
        dragOptions={DRAG_CANVAS_OPTIONS}
        itemRef={ref}
        dragStart={onStartDragCanvas}
        dragMove={onDraggingCanvas}
        dragEnd={onEndDragCanvas}
      >
        <CanvasMover
          canvasRef={canvasRef}
          dragRef={ref}
          positionRef={positionRef}
        >
          <div
            ref={ref}
            className={styles.canvas}
            onClick={(e) => onSelect({ e, ids: [] })}
            // style={getStyles({ draggingMode })}
          >
            <div ref={canvasRef} className={styles.drag}>
              {(data?.nodes ?? []).map((node) => (
                <SchemaNode key={node.id} data={node}>
                  {children}
                </SchemaNode>
              ))}
            </div>
            <SelectionBox></SelectionBox>
            <Navigator showMap={true} data={data}></Navigator>
          </div>
        </CanvasMover>
      </DragItem>
    </Dragger>
  );
});

SchemaEditorCanvas.displayName = "SchemaEditorCanvas";
