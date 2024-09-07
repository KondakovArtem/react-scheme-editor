import type { MouseEvent } from "react";
import { SchemaEditorNode } from "../models";
import { atom } from "jotai";
import { configAtom } from ".";
import { isEqual } from "../utils/isEqual";

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

export const onSelectNodeAtom = atom(
  null,
  (get, set, { e, ids }: SelectNodeDispatcherData) => {
    const selected = get(selectedNodeAtom);
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
    }
  }
);
