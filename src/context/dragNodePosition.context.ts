import { atom } from "jotai";
import { Position, SchemaEditorNode } from "../models";
import { selectedNodeAtom } from "./selected.context";
import { IDraggingEvent } from "../components/drag/Dragger";
import { nodeRectsAtom } from "./rects.context";

type DragNodePosition = {
  [key: SchemaEditorNode["id"]]: Position;
};

export const dragNodePositionAtom = atom<DragNodePosition>({});

export const updateDragNodePositionAtom = atom(
  null,
  (get, set, event: IDraggingEvent) => {
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

    set(dragNodePositionAtom, dragNodePosition);
  }
);
