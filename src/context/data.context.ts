import { atom } from "jotai";
import { SchemaEditorData } from "../models";
import { dragPositionAtom } from "./dragNodePosition.context";
import { methodsAtom } from "./methods.context";
import { nodeRectsAtom } from "./rects.context";

export const dataAtom = atom<SchemaEditorData | undefined>(undefined);

export const updateDataNodePositionAtom = atom(null, (get, set) => {
  const data = get(dataAtom);
  // const dragPosition = get(dragPositionAtom);
  const rects = get(nodeRectsAtom);

  const { onChangeData } = get(methodsAtom) ?? {};

  const newData = {
    ...data,
    nodes: data?.nodes?.map((node) => {
      const rect = rects[node.id];
      if (rect) {
        const { x, y } = rect;
        return {
          ...node,
          position: { x, y },
        };
      }
      return node;
    }),
  };
  set(dataAtom, newData);

  onChangeData?.(newData);
});

export const updateLinkPointsAtom = atom(null, (get, set) => {
  const data = get(dataAtom);
  const { linkPointer } = get(dragPositionAtom);
  const { onChangeData } = get(methodsAtom) ?? {};
  const newData = {
    ...data,
    links: data?.links?.map((link) => {
      const dragPoints = linkPointer[link.id];
      if (linkPointer[link.id]) {
        const points = [...(link.points ?? [])];
        dragPoints.forEach((point, idx) => {
          if (point) {
            points[idx] = point;
          }
        });
        return {
          ...link,
          points,
        };
      }
      return link;
    }),
  };

  set(dataAtom, newData);
  onChangeData?.(newData);
});
