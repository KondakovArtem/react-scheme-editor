import { FC } from "react";

import style from "./SelectionBox.module.scss";

export const SelectionBox: FC = () => {
  // const ctx = useContext(SchemaEditorContext);

  return (
    <div
      className={[
        style.box,
        // !!ctx?.selectionStartPos ? style.visible : "",
      ].join(" ")}
    ></div>
  );
};
