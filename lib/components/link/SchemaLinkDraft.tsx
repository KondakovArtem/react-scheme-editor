import { FC } from "react";

import { useAtomValue } from "jotai";

import { draftLinkAtom } from "../../context/dragNodePosition.context";
import { LinkPath } from "./LinkPath";
import { useSlotPosition } from "../../hooks/usePosition";

export const SchemaLinkDraft: FC = () => {
  const draftLink = useAtomValue(draftLinkAtom);

  const fromSlot =
    useSlotPosition(draftLink?.from.id, "out") ?? draftLink?.from?.rect;
  const toSlot =
    useSlotPosition(draftLink?.to.id, "in") ?? draftLink?.to?.rect;

  console.log(fromSlot, toSlot);

  return (
    <>
      {fromSlot && toSlot && (
        <LinkPath
          id="__draft"
          handle={false}
          fromSlot={fromSlot}
          toSlot={toSlot}
        />
      )}
    </>
  );
};

SchemaLinkDraft.displayName = "SchemaLinkDraft";
