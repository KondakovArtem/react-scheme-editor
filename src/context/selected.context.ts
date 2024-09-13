import type { MouseEvent } from "react";
import { EDraggingMode, MouseTouchEvent, SchemaEditorNode } from "../models";
import { atom } from "jotai";
import { configAtom } from ".";
import { isEqual } from "../utils/isEqual";
import { methodsAtom } from "./methods.context";
import { dragginModeAtom } from "./draggingMode.context";

interface SelectNodeDispatcherData {
  e: MouseEvent;
  ids: SchemaEditorNode["id"][];
}
export type SelectNodeDispatcher = (data: SelectNodeDispatcherData) => void;

export const selectedNodeAtom = atom(
  (get) => get(configAtom)?.selected,
  (get, set, selected: string[]) =>
    set(configAtom, { ...get(configAtom), selected })
);

export const onClickElementAtom = atom(
  null,
  (get, set, { e, ids }: SelectNodeDispatcherData) => {
    if (get(dragginModeAtom) === EDraggingMode.none) {
      const selected = get(selectedNodeAtom);
      const { onSelect } = get(methodsAtom) ?? {};
      let newSelected = [];
      if (e.ctrlKey && ids.length === 1) {
        newSelected = selected?.includes(ids[0])
          ? selected.filter((i) => i !== ids[0])
          : [...(selected ?? []), ids[0]];
      } else {
        newSelected = ids;
      }
      if (!isEqual(selected, newSelected)) {
        set(selectedNodeAtom, newSelected);
        onSelect?.(newSelected);
      }
    }
  }
);

export const onDownNodeAtom = atom(
  null,
  (get, set, { e, id }: { e: MouseTouchEvent; id: string }) => {
    if (get(dragginModeAtom) === EDraggingMode.none) {
      const selected = get(selectedNodeAtom);
      const { onSelect } = get(methodsAtom) ?? {};

      if (selected?.includes(id)) {
        return;
      }
      let newSelected = [];
      if (e.ctrlKey && id) {
        newSelected = [...(selected ?? []), id];
      } else {
        newSelected = [id];
      }
      if (!isEqual(selected, newSelected)) {
        set(selectedNodeAtom, newSelected);
        onSelect?.(newSelected);
      }
    }
  }
);
