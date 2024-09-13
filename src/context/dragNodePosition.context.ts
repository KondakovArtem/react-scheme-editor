import { atom } from "jotai";
import { Position } from "../models";
import { selectedNodeAtom } from "./selected.context";
import { IDraggingEvent } from "../components/drag/Dragger";
import { nodeRectsAtom } from "./rects.context";

type DragNodePosition = { [nodeId: string]: Position };
type DragPointerPosition = { [linkId: string]: Position[] };

type DragPosition = {
  node: DragNodePosition;
  linkPointer: DragPointerPosition;
};

export const dragPositionAtom = atom<DragPosition>({
  node: {},
  linkPointer: {},
});

export const updateDragNodePositionAtom = atom(
  null,
  (get, set, event: IDraggingEvent) => {
    const dragPosition = get(dragPositionAtom);
    const selected = get(selectedNodeAtom) ?? [];
    const rects = get(nodeRectsAtom);
    const dragNodePosition = selected?.reduce((pre, id) => {
      const origin = rects[id];
      const { dPos } = event;
      if (origin && dPos) {
        pre[id] = {
          x: origin.x + dPos.scale.x,
          y: origin.y + dPos.scale.y,
        };
      }

      return pre;
    }, {} as DragNodePosition);

    set(dragPositionAtom, {
      ...dragPosition,
      node: dragNodePosition,
    });
  }
);

export const updateDragPointerAtom = atom(
  null,
  (get, set, linkPointer: DragPointerPosition) => {
    const dragPosition = get(dragPositionAtom);

    set(dragPositionAtom, {
      ...dragPosition,
      linkPointer: {
        ...dragPosition.linkPointer,
        ...linkPointer,
      },
    });
  }
);

export const clearDragPointerAtom = atom(null, (get, set) => {
  set(dragPositionAtom, {
    node: {},
    linkPointer: {},
  });
});
