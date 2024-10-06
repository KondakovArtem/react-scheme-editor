import { FC } from "react";
import "./SelectBox.scss";
import { selectboxRectAtom } from "../../context/selectboxRect.context";
import { useAtomValue } from "jotai";

export const SelectBox: FC = () => {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
  } = useAtomValue(selectboxRectAtom) ?? {};

  const styles = {
    transform: `translate(${x}px, ${y}px)`,
    width: `${width}px`,
    height: `${height}px`,
  };

  return <div className="schema-editor__selectbox" style={styles}></div>;
};
