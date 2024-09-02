import { FC, useContext } from "react";
import { SchemeEditorContext } from "../context/editor";

import "./SelectionBox.css";

export const SelectionBox: FC = () => {
  const ctx = useContext(SchemeEditorContext);

  return (
    <div
      className={`schema-editor-selection-box ${
        !!ctx?.selectionStartPos ? "schema-editor-selection-box-visible" : ""
      }`}
    ></div>
  );
};
