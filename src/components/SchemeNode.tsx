import {
  CSSProperties,
  FC,
  MouseEventHandler,
  useCallback,
  useContext,
  useRef,
} from "react";
import type { SchemaEditorNode } from "../models";
import "./SchemeNode.css";
import { SchemeEditorContext } from "../context/editor";

function nodeStyles({ position }: SchemaEditorNode): CSSProperties {
  const { x = 0, y = 0 } = position ?? {};
  return {
    transform: `translate(${Math.round(x)}px, ${Math.round(y)}px)`,
  };
}

export interface SchemaEditorNodeProps {
  data: SchemaEditorNode;
}

export const SchemeNode: FC<SchemaEditorNodeProps> = (props) => {
  const { data } = props;
  const { id } = data;
  const ctx = useContext(SchemeEditorContext);
  const { onSelect, NodeTemplate } = ctx ?? {};
  const ref = useRef(null);

  const click = useCallback<MouseEventHandler>(
    (event) => {
      onSelect?.({ event, id });
    },
    [onSelect, id]
  );

  return (
    <div
      onClick={click}
      ref={ref}
      className="scheme-editor-node"
      style={nodeStyles(data)}
    >
      {NodeTemplate && <NodeTemplate data={data}></NodeTemplate>}
    </div>
  );
};
