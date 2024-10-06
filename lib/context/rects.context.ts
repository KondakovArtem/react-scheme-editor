import { atom } from "jotai";
import { TRect, TRecord } from "../models";

export type NodeRects = TRecord<TRect | undefined>;
export const nodeRectsAtom = atom<NodeRects>({});

export const updateRectsAtom = atom(
  {} as NodeRects,
  (get, set, newRects: TRecord<Partial<TRect> | undefined>) => {
    const rects = get(nodeRectsAtom);
    const ids = Object.keys(newRects);

    const nodeRects = ids.reduce(
      (pre, id) => {
        if (!newRects[id]) {
          delete pre[id];
        } else {
          pre[id] = { ...pre[id], ...newRects[id] } as DOMRect;
        }
        return pre;
      },
      { ...rects }
    );

    set(nodeRectsAtom, nodeRects);
  }
);
