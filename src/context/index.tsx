import { atom } from "jotai";
import { Rect, SchemaEditorConfig, TRecord } from "../models";

export const configAtom = atom<SchemaEditorConfig | undefined>(undefined);

export const showNavigatorAtom = atom(
  (get) => get(configAtom)?.showNavigator,
  (get, set, showNavigator: boolean | undefined) =>
    set(configAtom, { ...get(configAtom), showNavigator })
);

export type NodeRects = TRecord<Rect | undefined>;
export const nodeRectsAtom = atom({}, (get, set, rects: NodeRects) => {
  set(nodeRectsAtom, {
    ...get(nodeRectsAtom),
    ...rects,
  });
});
