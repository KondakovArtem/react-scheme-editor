import { FC, PropsWithChildren, useRef } from "react";

import "./Slot.scss";
import { DragItem } from "../drag/DragItem";
import { IDragItem } from "../drag/Dragger";

import "./SlotHandler.scss";
import { useSetAtom } from "jotai";
import {
  draftLinkAtom,
  onAddDraftLinkAtom,
  setDraftLinkToAtom,
} from "../../context/dragNodePosition.context";
import { TangentDirections } from "../../models";

export interface SlotHandlerProps {
  id: string;
}

export const SlotHandler: FC<PropsWithChildren<SlotHandlerProps>> = ({
  id,
  children,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const setDraftLink = useSetAtom(draftLinkAtom);
  const setDraftLinkTo = useSetAtom(setDraftLinkToAtom);
  const onAddDraftLink = useSetAtom(onAddDraftLinkAtom);

  const stateRef = useRef({
    slotDragStart: ((e) => {
      setDraftLink({
        from: { id },
        to: {
          rect: {
            ...e.current.scale,
            width: 1,
            height: 1,
            directions: [TangentDirections.AUTO],
          },
        },
      });
    }) as IDragItem["dragStart"],
    slotDragMove: ((e) => setDraftLinkTo(e)) as IDragItem["dragMove"],
    slotDragEnd: ((e) => onAddDraftLink(e)) as IDragItem["dragEnd"],
  });

  const { slotDragStart, slotDragMove, slotDragEnd } = stateRef.current;

  return (
    <div ref={ref} className="schema-editor__slot-handler">
      <DragItem
        itemRef={ref}
        dragStart={slotDragStart}
        dragMove={slotDragMove}
        dragEnd={slotDragEnd}
      ></DragItem>
      {children}
    </div>
  );
};
