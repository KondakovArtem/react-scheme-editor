import {
  FC,
  memo,
  MouseEventHandler,
  useCallback,
  useMemo,
  useRef,
} from "react";

import "./SchemaEditor.scss";

import {
  EDraggingMode,
  EMouseButton,
  Position,
  SchemaEditorConfig,
  SchemaEditorData,
  SchemaEditorNode,
} from "../models";
import { SchemaNode } from "./node/SchemaNode";
import { SelectBox } from "./selectbox/SelectBox";
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
import {
  selectboxRectAtom,
  selectBySelectBoxAtom,
} from "../context/selectboxRect.context";
import { SchemaLink } from "./link/SchemaLink";

interface SchemaEditorCanvasProps {
  data?: SchemaEditorData;
  children: FC<SchemaEditorNode>;
}

const DRAG_CANVAS_OPTIONS: DragOptions = {
  button: [EMouseButton.left, EMouseButton.middle],
  delay: 100,
};

export const SchemaEditorCanvas: FC<SchemaEditorCanvasProps> = memo((props) => {
  const { data, children } = props;

  const showNavigator = useAtomValue(showNavigatorAtom);

  const ref = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  useResize({ ref, onResize: useSetAtom(canvasSizeAtom) });

  const setCanvasPosition = useSetAtom(canvasPositionAtom);
  const setSelectboxRect = useSetAtom(selectboxRectAtom);
  const selectBySelectBox = useSetAtom(selectBySelectBoxAtom);
  const [draggingMode, setDraggingMode] = useAtom(dragginModeAtom);
  const { onChangeConfig, onSelect } = useAtomValue(methodsAtom) ?? {};

  // const selectboxRect = useAtomValue(selectboxRectAtom);

  const positionRef = useRef<Position>();

  const stateRef = useRef<{
    originCanvasPos?: Position;
    onStartDragCanvas: DragItemProps["dragStart"];
    onDraggingCanvas: DragItemProps["dragMove"];
    onEndDragCanvas: DragItemProps["dragEnd"];
    onChangeConfig?: (data: Partial<SchemaEditorConfig>) => void;
    draggingMode: EDraggingMode;
    // canvasPosition: Position;
  }>({
    draggingMode,
    originCanvasPos: undefined,
    onStartDragCanvas: (e) => {
      if ((e.e as MouseEvent).button === EMouseButton.middle) {
        stateRef.current.originCanvasPos = positionRef.current; // stateRef.current.position;
        setDraggingMode(EDraggingMode.canvas);
      } else {
        setDraggingMode(EDraggingMode.selection);
      }
    },
    onDraggingCanvas: (e) => {
      e.e.preventDefault();
      const { originCanvasPos, draggingMode } = stateRef.current;
      if (draggingMode === EDraggingMode.canvas) {
        if (originCanvasPos) {
          const canvasPosition = {
            x: originCanvasPos.x + (e.dPos?.canvas?.x ?? 0),
            y: originCanvasPos.y + (e.dPos?.canvas?.y ?? 0),
          };
          setCanvasPosition(canvasPosition);
        }
      } else if (draggingMode === EDraggingMode.selection) {
        const { origin, dPos } = e;
        if (dPos) {
          setSelectboxRect({
            x: origin.canvas.x + (dPos.canvas.x < 0 ? dPos.canvas.x : 0),
            y: origin.canvas.y + (dPos.canvas.y < 0 ? dPos.canvas.y : 0),
            width: Math.abs(dPos.canvas.x),
            height: Math.abs(dPos.canvas.y),
          });
        }
      }
    },
    onEndDragCanvas: (e) => {
      e.e.preventDefault();
      setTimeout(() => setDraggingMode(EDraggingMode.none));
      const { originCanvasPos, draggingMode } = stateRef.current;

      if (draggingMode === EDraggingMode.canvas) {
        if (originCanvasPos) {
          delete stateRef.current.originCanvasPos;
          stateRef.current.onChangeConfig?.({
            canvasPosition: {
              x: originCanvasPos.x + (e.dPos?.canvas?.x ?? 0),
              y: originCanvasPos.y + (e.dPos?.canvas?.y ?? 0),
            },
          });
        }
      } else if (draggingMode === EDraggingMode.selection) {
        selectBySelectBox?.(e);
        setSelectboxRect(undefined);
      }
    },
    onChangeConfig,
  });
  Object.assign(stateRef.current, { onChangeConfig, draggingMode });

  const { onDraggingCanvas, onEndDragCanvas, onStartDragCanvas } =
    stateRef.current;

  const [selected, setSelected] = useAtom(selectedNodeAtom);

  const clearSelected = useCallback<MouseEventHandler>(
    (e) => {
      if (
        draggingMode === EDraggingMode.none &&
        !isEqual(selected, []) &&
        !e.ctrlKey
      ) {
        setSelected([]);
        onSelect?.([]);
      }
    },
    [onSelect, draggingMode, selected, setSelected]
  );

  const canvasClasses = useMemo(
    () =>
      [
        "schema-editor__canvas",
        ([
          EDraggingMode.canvas,
          EDraggingMode.item,
          EDraggingMode.point,
        ].includes(draggingMode) &&
          "schema-editor__canvas--dragging") ||
          "",
      ].join(" "),
    [draggingMode]
  );

  return (
    <>
      <Dragger dragRef={ref}></Dragger>
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
      <div ref={ref} className={canvasClasses} onClick={clearSelected}>
        <div ref={canvasRef} className="schema-editor__drag">
          {(data?.nodes ?? []).map((node) => (
            <SchemaNode key={node.id} data={node}>
              {children}
            </SchemaNode>
          ))}
          {(data?.links ?? []).map((link) => (
            <SchemaLink key={link.id} data={link} />
          ))}
        </div>
        {draggingMode === EDraggingMode.selection && <SelectBox></SelectBox>}
        {showNavigator !== false && <Navigator data={data}></Navigator>}
      </div>
    </>
  );
});

SchemaEditorCanvas.displayName = "SchemaEditorCanvas";
