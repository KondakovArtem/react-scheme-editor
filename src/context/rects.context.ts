import { atom } from "jotai";
import { Rect, TRecord } from "../models";

export type NodeRects = TRecord<Rect | undefined>;
export const nodeRectsAtom = atom({}, (get, set, rects: NodeRects) => {
  set(nodeRectsAtom, {
    ...get(nodeRectsAtom),
    ...rects,
  });
});
