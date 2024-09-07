import { FC, memo, useRef } from "react";

import styles from "./SchemaEditor.module.scss";
import { useCanvas } from "../hooks/useCanvas";
import {
  EDraggingMode,
  Position,
  SchemaEditorConfig,
  SchemaEditorData,
  SchemaEditorNode,
} from "../models";
import { SchemaNode } from "./node/SchemaNode";
import { SelectionBox } from "./selectionbox/SelectionBox";
import { Navigator } from "./navigator/Navigator";
import { Dragger } from "./drag/Dragger";
import { DragItem, DragItemProps, DragOptions } from "./drag/DragItem";
import { methodsAtom } from "../context/methods.context";

import { CanvasMover } from "./CanvasMover";
import { useResize } from "../hooks/useResize";

// import { useSelectedContext } from "../context/selected.context";
import { isEqual } from "../utils/isEqual";
import { showNavigatorAtom } from "../context";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { canvasPositionAtom } from "../context/canvasPosition.context";
import { canvasSizeAtom } from "../context/canvasSize.context";
import { dragginModeAtom } from "../context/draggingMode.context";
import { selectedNodeAtom } from "../context/selected.context";

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

  const showNavigator = useAtomValue(showNavigatorAtom);

  const { ref, canvasRef } = useCanvas<HTMLDivElement>();
  useResize({ ref, onResize: useSetAtom(canvasSizeAtom) });

  const setCanvasPosition = useSetAtom(canvasPositionAtom);
  const [draggingMode, setDraggingMode] = useAtom(dragginModeAtom);
  const { onChangeConfig } = useAtomValue(methodsAtom) ?? {};

  const positionRef = useRef<Position>();

  const stateRef = useRef<{
    originCanvasPos?: Position;
    onStartDragCanvas: DragItemProps["dragStart"];
    onDraggingCanvas: DragItemProps["dragMove"];
    onEndDragCanvas: DragItemProps["dragEnd"];
    onChangeConfig?: (data: Partial<SchemaEditorConfig>) => void;
  }>({
    originCanvasPos: undefined,
    onStartDragCanvas: (e) => {
      setDraggingMode(EDraggingMode.canvas);
      stateRef.current.originCanvasPos = positionRef.current; // stateRef.current.position;
    },
    onDraggingCanvas: (e) => {
      const { originCanvasPos } = stateRef.current;
      e.e.preventDefault();
      if (originCanvasPos) {
        const canvasPosition = {
          x: originCanvasPos.x + (e.dPos?.canvas?.x ?? 0),
          y: originCanvasPos.y + (e.dPos?.canvas?.y ?? 0),
        };
        setCanvasPosition(canvasPosition);
      }
    },
    onEndDragCanvas: (e) => {
      e.e.preventDefault();
      const { originCanvasPos } = stateRef.current;
      if (originCanvasPos) {
        delete stateRef.current.originCanvasPos;
        setDraggingMode(EDraggingMode.none);
        stateRef.current.onChangeConfig?.({
          canvasPosition: {
            x: originCanvasPos.x + (e.dPos?.canvas?.x ?? 0),
            y: originCanvasPos.y + (e.dPos?.canvas?.y ?? 0),
          },
        });
      }
    },
    onChangeConfig,
  });
  Object.assign(stateRef.current, { onChangeConfig });

  const { onDraggingCanvas, onEndDragCanvas, onStartDragCanvas } =
    stateRef.current;

  const [selected, onSelect] = useAtom(selectedNodeAtom);

  return (
    <>
      <Dragger dragRef={ref}>
        <DragItem
          dragOptions={DRAG_CANVAS_OPTIONS}
          itemRef={ref}
          dragStart={onStartDragCanvas}
          dragMove={onDraggingCanvas}
          dragEnd={onEndDragCanvas}
        ></DragItem>
        <CanvasMover
          canvasRef={canvasRef}
          dragRef={ref}
          positionRef={positionRef}
        ></CanvasMover>
        <div
          ref={ref}
          className={styles.canvas}
          onClick={(e) =>
            draggingMode === EDraggingMode.none &&
            !isEqual(selected, []) &&
            onSelect([])
          }
        >
          <div ref={canvasRef} className={styles.drag}>
            {(data?.nodes ?? []).map((node) => (
              <SchemaNode key={node.id} data={node}>
                {children}
              </SchemaNode>
            ))}
          </div>
          <SelectionBox></SelectionBox>

          {showNavigator !== false && <Navigator data={data}></Navigator>}
        </div>
      </Dragger>
    </>
  );
});

SchemaEditorCanvas.displayName = "SchemaEditorCanvas";
