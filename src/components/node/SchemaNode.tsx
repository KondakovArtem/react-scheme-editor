import {
  CSSProperties,
  FC,
  useCallback,
  useRef,
  MouseEventHandler,
  useMemo,
  memo,
  createContext,
  MutableRefObject,
} from "react";
import {
  EDraggingMode,
  EMouseButton,
  Position,
  TRect,
  type SchemaEditorNode,
} from "../../models";
import "./SchemaNode.scss";

import { useResize } from "../../hooks/useResize";
import { useSetAtom } from "jotai";
import { NodeRects, updateRectsAtom } from "../../context/rects.context";
import {
  onClickElementAtom,
  onDownNodeAtom,
  selectedNodeAtom,
} from "../../context/selected.context";
import { useSelectAtomValue } from "../../utils/atom.selector";
import { DragItem, DragOptions } from "../drag/DragItem";
import { IDragItem } from "../drag/Dragger";
import { dragginModeAtom } from "../../context/draggingMode.context";
import {
  dragPositionAtom,
  updateDragNodePositionAtom,
} from "../../context/dragNodePosition.context";
import { updateDataNodePositionAtom } from "../../context/data.context";
import { isEmpty } from "../../utils/isEmpty";

function nodeStyles(position: SchemaEditorNode["position"]): CSSProperties {
  const { x = 0, y = 0 } = position ?? {};
  return {
    transform: `translate(${Math.round(x)}px, ${Math.round(y)}px)`,
  };
}

const DRAG_NODE_OPTIONS: DragOptions = {
  button: [EMouseButton.left],
  delay: 100,
};

export interface SchemaEditorNodeProps {
  data: SchemaEditorNode;
  children?: FC<SchemaEditorNode>;
}

export const NodePositionContext = createContext<
  | {
      ref: MutableRefObject<HTMLElement | null>;
      id: string;
    }
  | undefined
>(undefined);

export const SchemaNode: FC<
  SchemaEditorNodeProps & {
    children?: FC<SchemaEditorNode>;
  }
> = memo(({ data, children }) => {
  const updateRects = useSetAtom(updateRectsAtom);
  const onClickNode = useSetAtom(onClickElementAtom);
  const { id, position } = data;

  const setDraggingMode = useSetAtom(dragginModeAtom);
  const setDragPosition = useSetAtom(dragPositionAtom);
  const updateDragNodePosition = useSetAtom(updateDragNodePositionAtom);
  const updateDataNodePosition = useSetAtom(updateDataNodePositionAtom);

  const dragPosition = useSelectAtomValue(
    dragPositionAtom,
    (drag) => drag.node[id],
    [id]
  );
  const active = useSelectAtomValue(
    selectedNodeAtom,
    (s) => s?.includes(id) ?? false,
    [id]
  );
  const onDownNode = useSetAtom(onDownNodeAtom);

  const stateRef = useRef({
    data,
    nodeDragStart: ((e) => {
      onDownNode({ e: e.e, id });
      setDraggingMode(EDraggingMode.item);
    }) as IDragItem["dragStart"],
    nodeDragMove: ((e) => updateDragNodePosition(e)) as IDragItem["dragMove"],
    nodeDragEnd: ((e) => {
      setTimeout(() => setDraggingMode(EDraggingMode.none));
      updateDataNodePosition();
      setDragPosition({ node: {}, linkPointer: {} });
    }) as IDragItem["dragEnd"],
  });
  Object.assign(stateRef.current, { data });

  const ref = useRef<HTMLDivElement | null>(null);

  useResize({
    ref,
    onResize: useCallback(
      ({ width, height, x, y }: Partial<TRect>) => {
        const newRect: Partial<TRect> = {};
        if (x !== undefined) newRect.x = x;
        if (y !== undefined) newRect.y = y;
        if (width !== undefined) newRect.width = width;
        if (height !== undefined) newRect.height = height;
        updateRects?.({
          [id]: isEmpty(newRect) ? undefined : newRect,
        } as NodeRects);
      },
      [id, updateRects]
    ),
    position,
  });

  const nodeStyle = useMemo(
    () => nodeStyles(dragPosition ?? position),
    [position, dragPosition]
  );

  const onClick = useCallback<MouseEventHandler>(
    (e) => {
      e.stopPropagation();
      onClickNode({ e, ids: [id] });
    },
    [id, onClickNode]
  );

  const classes = useMemo(
    () => ["schema-editor__node", active ? "active" : ""].join(" "),
    [active]
  );

  const { nodeDragStart, nodeDragEnd, nodeDragMove } = stateRef.current;

  const context = useMemo(() => ({ id, ref }), [id, ref]);

  return (
    <NodePositionContext.Provider value={context}>
      <DragItem
        itemRef={ref}
        dragStart={nodeDragStart}
        dragMove={nodeDragMove}
        dragEnd={nodeDragEnd}
        dragOptions={DRAG_NODE_OPTIONS}
      ></DragItem>
      <div ref={ref} className={classes} onClick={onClick} style={nodeStyle}>
        {children && children(data, active)}
      </div>
    </NodePositionContext.Provider>
  );
});

SchemaNode.displayName = "SchemaNode";
