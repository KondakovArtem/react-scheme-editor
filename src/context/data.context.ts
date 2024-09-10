import { atom } from "jotai";
import { SchemaEditorData } from "../models";
import { dragNodePositionAtom } from "./dragNodePosition.context";
import { methodsAtom } from "./methods.context";

export const dataAtom = atom<SchemaEditorData | undefined>(undefined);

export const updateDataNodePositionAtom = atom(null, (get, set) => {
  const data = get(dataAtom);
  const dragNodePosition = get(dragNodePositionAtom);
  const { onChangeData } = get(methodsAtom) ?? {};

  const newData = {
    ...data,
    nodes: data?.nodes?.map((node) => {
      if (dragNodePosition[node.id]) {
        return {
          ...node,
          position: dragNodePosition[node.id],
        };
      }
      return node;
    }),
  };
  set(dataAtom, newData);
  onChangeData?.(newData);
});
