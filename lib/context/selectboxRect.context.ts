import { atom } from "jotai";
import { TRect } from "../models";
import { nodeRectsAtom } from "./rects.context";
import { IDraggingEvent } from "../components/drag/Dragger";
import { selectedNodeAtom } from "./selected.context";

import { methodsAtom } from "./methods.context";
import { dataAtom } from "./data.context";

export const selectboxRectAtom = atom<TRect | undefined>();

function intersects(r1: TRect, r2: TRect): boolean {
  return !(
    r1.x > r2.x + r2.width ||
    r1.x + r1.width < r2.x ||
    r1.y > r2.y + r2.height ||
    r1.y + r1.height < r2.y
  );
}
function insideRect(inner: TRect, outer: TRect): boolean {
  return (
    inner.x >= outer.x &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y >= outer.y &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

export const selectBySelectBoxAtom = atom(
  null,
  (get, set, event: IDraggingEvent) => {
    const rects = get(nodeRectsAtom);
    const selectedNode = get(selectedNodeAtom) ?? [];
    const { nodes } = get(dataAtom) ?? {};
    const allIds = nodes?.map((i) => i.id);

    const partial =
      (event.dPos?.handler.x ?? 0) < 0 || (event.dPos?.handler.y ?? 0) < 1;

    const { origin, dPos } = event;
    if (origin && dPos) {
      const scaleSelectedBox = {
        x: origin.scale.x + (dPos.scale.x < 0 ? dPos.scale.x : 0),
        y: origin.scale.y + (dPos.scale.y < 0 ? dPos.scale.y : 0),
        width: Math.abs(dPos.scale.x),
        height: Math.abs(dPos.scale.y),
      };

      let newSelectedNodes = Object.keys(rects)
        .map((id) => {
          const rect = rects[id];
          if (
            allIds?.includes(id) &&
            rect &&
            ((partial && intersects(rect, scaleSelectedBox)) ||
              (!partial && insideRect(rect, scaleSelectedBox)))
          ) {
            return id;
          }
          return undefined;
        })
        .filter((i) => i) as string[];
      if (event.e.ctrlKey) {
        newSelectedNodes = [...newSelectedNodes, ...selectedNode];
      }
      set(selectedNodeAtom, newSelectedNodes);
      get(methodsAtom)?.onSelect?.(newSelectedNodes);
    }
  }
);
