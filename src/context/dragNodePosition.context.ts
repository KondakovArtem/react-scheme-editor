import { atom } from "jotai";
import {
  Position,
  SchemaEditorNodeLinkDraft,
  TangentDirections,
} from "../models";
import { selectedNodeAtom } from "./selected.context";
import { IDraggingEvent } from "../components/drag/Dragger";
import { NodeRects, nodeRectsAtom } from "./rects.context";
import { dataAtom } from "./data.context";
import { Rect } from "../utils/rect";
import { methodsAtom } from "./methods.context";

type DragPointerPosition = { [linkId: string]: Position[] };

type DragPosition = {
  linkPointer: DragPointerPosition;
};

export const dragPositionAtom = atom<DragPosition>({
  linkPointer: {},
});

export const updateDragNodePositionAtom = atom(
  null,
  (get, set, event: IDraggingEvent) => {
    const selected = get(selectedNodeAtom) ?? [];
    const data = get(dataAtom);
    const rects = get(nodeRectsAtom);
    const dragNodeRects: NodeRects = selected?.reduce((pre, id) => {
      const origin = data?.nodes?.find((i) => i.id === id)?.position;
      const rect = rects[id];
      const { dPos } = event;
      if (origin && dPos && rect) {
        pre[id] = {
          ...rect,
          x: origin.x + dPos.scale.x,
          y: origin.y + dPos.scale.y,
        };
      }

      return pre;
    }, {} as NodeRects);
    set(nodeRectsAtom, {
      ...rects,
      ...dragNodeRects,
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
    linkPointer: {},
  });
});

export const draftLinkAtom = atom<SchemaEditorNodeLinkDraft | undefined>(
  undefined
);

export const setDraftLinkToAtom = atom(
  null,
  (get, set, event: IDraggingEvent) => {
    const draftLink = get(draftLinkAtom);

    const rects = get(nodeRectsAtom);

    const toRect = new Rect({
      ...event.current.scale,
      width: 1,
      height: 1,
    });

    const toId = Object.keys(rects).find(
      (id) =>
        draftLink?.from.id !== id && new Rect(rects[id]).intersects(toRect)
    );

    set(draftLinkAtom, {
      from: get(draftLinkAtom)?.from as SchemaEditorNodeLinkDraft["from"],
      to: {
        id: toId,
        rect: { ...toRect.toJson(), directions: [TangentDirections.AUTO] },
      },
    });
  }
);

export const onAddDraftLinkAtom = atom(
  null,
  (get, set, event: IDraggingEvent) => {
    const draftLink = get(draftLinkAtom);
    const { onAddLink } = get(methodsAtom) ?? {};

    if (draftLink?.from.id && draftLink?.to.id) {
      onAddLink?.({
        from: draftLink?.from.id,
        to: draftLink?.to.id,
      });
    }
    set(draftLinkAtom, undefined);
  }
);
