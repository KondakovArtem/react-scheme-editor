import {
  CSSProperties,
  FC,
  useCallback,
  useRef,
  MouseEventHandler,
  useMemo,
  useEffect,
} from "react";
import type { SchemaEditorNode } from "../../models";
import "./SchemaNode.scss";

import { useResize } from "../../hooks/useResize";
import { useNodeRectsDispatch } from "../../context/rects.context";
import {
  useGetSelectedRef,
  useSelectedNodeDispatch,
  useSelectedNodeState,
} from "../../context/selected.context";

function nodeStyles(position: SchemaEditorNode["position"]): CSSProperties {
  const { x = 0, y = 0 } = position ?? {};
  return {
    transform: `translate(${Math.round(x)}px, ${Math.round(y)}px)`,
  };
}

export interface SchemaEditorNodeProps {
  data: SchemaEditorNode;
  children?: FC<SchemaEditorNode>;
}

export const SchemaNode: FC<
  SchemaEditorNodeProps & {
    children?: FC<SchemaEditorNode>;
  }
> = ({ data, children }) => {
  const dataRef = useRef(data);
  dataRef.current = data;
  const ref = useRef<HTMLDivElement>(null);

  const onSelect = useSelectedNodeDispatch();
  const selectedRef = useGetSelectedRef();
  const selected = useSelectedNodeState();
  const { id } = data;

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    children;
    debugger;
  }, [children]);
  useEffect(() => {
    debugger;
  }, [data]);

  const setRects = useNodeRectsDispatch();
  useResize({
    ref,
    onResize: useCallback(
      ({ width, height }: DOMRect) =>
        setRects?.({
          [data.id]: { width, height, ...dataRef.current.position },
        }),
      [data.id, setRects]
    ),
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const nodeStyle = useMemo(() => nodeStyles(data.position), [data.position]);

  const onClick = useCallback<MouseEventHandler>(
    (e) => {
      e.stopPropagation();
      let newSelected: SchemaEditorNode["id"][] = [];
      if (e.ctrlKey) {
        const selected = selectedRef.current ?? [];
        newSelected = selected?.includes(id)
          ? selected.filter((i) => i !== id)
          : [...selected, id];
      } else {
        newSelected = [id];
      }
      onSelect({ e, ids: newSelected });
    },
    [id, onSelect, selectedRef]
  );
  console.log("render SchemaNode");

  const active = useMemo(() => selected.includes(id), [selected, id]);

  return (
    <div
      onClick={onClick}
      ref={ref}
      className={["schema-editor__node", active ? "active" : ""].join(" ")}
      style={nodeStyle}
    >
      {children && children(data)}
    </div>
  );
};

SchemaNode.displayName = "SchemaNode";
