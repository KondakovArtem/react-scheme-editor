import {
  CSSProperties,
  FC,
  useCallback,
  useRef,
  MouseEventHandler,
  useMemo,
  memo,
} from "react";
import type { SchemaEditorNode } from "../../models";
import "./SchemaNode.scss";

import { useResize } from "../../hooks/useResize";
import { useSetAtom } from "jotai";
import { nodeRectsAtom } from "../../context/rects.context";
import {
  onSelectNodeAtom,
  selectedNodeAtom,
} from "../../context/selected.context";
import { useSelectAtomValue } from "../../utils/atom.selector";

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
> = memo(({ data, children }) => {
  const dataRef = useRef(data);
  dataRef.current = data;
  const ref = useRef<HTMLDivElement>(null);

  // const [selected, onSelect] = useAtom(selectedNodeAtom);
  const { id } = data;

  const active = useSelectAtomValue(
    selectedNodeAtom,
    (s) => s?.includes(id) ?? false,
    [id]
  );

  const setRects = useSetAtom(nodeRectsAtom);
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

  const nodeStyle = useMemo(() => nodeStyles(data.position), [data.position]);
  const onSelectNode = useSetAtom(onSelectNodeAtom);

  const onClick = useCallback<MouseEventHandler>(
    (e) => {
      e.stopPropagation();
      onSelectNode({ e, ids: [id] });
    },
    [id, onSelectNode]
  );
  console.log("render SchemaNode");

  const classes = useMemo(
    () => ["schema-editor__node", active ? "active" : ""].join(" "),
    [active]
  );

  return (
    <div onClick={onClick} ref={ref} className={classes} style={nodeStyle}>
      {children && children(data, active)}
    </div>
  );
});

SchemaNode.displayName = "SchemaNode";
