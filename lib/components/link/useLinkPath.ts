import { dragPositionAtom } from "../../context/dragNodePosition.context";
import type { Position, ESchemaEditorLinkModels, SlotRect } from "../../models";

import { useMemo } from "react";
import { linkModels } from "./helpers";
import { useSelectAtomValue } from "../../utils/atom.selector";

const EMPTYDATA = {
  path: "",
  points: [] as Position[],
};

export function useLinkPath(
  from: SlotRect | undefined,
  to: SlotRect | undefined,
  rawpoints: Position[] = [],
  linkId: string,
  model: ESchemaEditorLinkModels
) {
  const points = useMemo(() => rawpoints ?? [], [rawpoints]);

  const dragPoints = useSelectAtomValue(
    dragPositionAtom,
    ({ linkPointer }) => linkPointer?.[linkId],
    [linkId]
  );

  return useMemo(() => {
    const resPoints = [...(points ?? [])];
    dragPoints?.forEach((dragPoint, idx) => {
      resPoints[idx] = dragPoint ?? resPoints[idx];
    });

    if (!!from && !!to) {
      const newLinkModel =
        linkModels[model]?.render({ from, to, points: resPoints }) ?? EMPTYDATA;
      return newLinkModel;
    }
    return EMPTYDATA;
  }, [dragPoints, from, model, points, to]);
}
