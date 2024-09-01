import React, { FC, useRef } from "react";
import "./SchemeEditor.css";
import { Dragger } from "./Dragger";
import { DragItem } from "./DragItem";
// export const SchemeEditor: FC = () => {
//   return <div>123</div>;
// };

export const SchemeEditor: FC = () => {
  const canvasRef = useRef(null);
  return (
    <Dragger ref={canvasRef}>
      <DragItem>
        <div ref={canvasRef} className="schema-editor-canvas">
          <div className="schema-editor-drag-canvas"></div>
        </div>
      </DragItem>
    </Dragger>
  );
};
