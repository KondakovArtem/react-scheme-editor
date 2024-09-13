import { atom, useAtomValue } from "jotai";
import { dragPositionAtom } from "../../context/dragNodePosition.context";
import type { Position, ESchemaEditorLinkModels, SlotRect } from "../../models";

import { useEffect, useMemo, useState } from "react";
import { linkModels } from "./helpers";

const EMPTYDATA = {
  path: "",
  points: [] as Position[],
};

export function useLinkPath(
  from: SlotRect | undefined,
  to: SlotRect | undefined,
  points: Position[],
  linkId: string,
  model: ESchemaEditorLinkModels
) {
  const dragPoints = useAtomValue(
    useMemo(
      () => atom((get) => get(dragPositionAtom).linkPointer?.[linkId]),
      [linkId]
    )
  );

  const [linkModel, setLinkModel] = useState(EMPTYDATA);

  useEffect(() => {
    const resPoints = [...(points ?? [])];
    dragPoints?.forEach((dragPoint, idx) => {
      resPoints[idx] = dragPoint ?? resPoints[idx];
    });
    if (!!from && !!to) {
      const newLinkModel =
        linkModels[model]?.render({ from, to, points: resPoints }) ?? EMPTYDATA;
      setLinkModel(newLinkModel);
    }
  }, [dragPoints, from, model, points, to]);

  return linkModel;
}
