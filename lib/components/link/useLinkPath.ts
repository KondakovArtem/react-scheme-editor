import { useMemo } from 'react';

import { dragPositionAtom } from '../../context/dragNodePosition.context';
import type { ESchemaEditorLinkModels, Position, SlotRect } from '../../models';
import { useSelectAtomValue } from '../../utils/atom.selector';

import { linkModels } from './helpers';

export const DRAFT_ID = '__draft';
const EMPTYDATA = { path: '', points: [] as Position[], drag: false };

export function useLinkPath(
  from: SlotRect | undefined,
  to: SlotRect | undefined,
  linkId: string,
  model: ESchemaEditorLinkModels,
  rawpoints: Position[] = []
) {
  const points = useMemo(() => rawpoints ?? [], [rawpoints]);

  const dragPoints = useSelectAtomValue(
    dragPositionAtom,
    ({ linkPointer }) => linkPointer?.[linkId],
    [linkId]
  );

  return useMemo(() => {
    if (!from || !to) {
      return EMPTYDATA;
    }
    const resPoints = [...(points ?? [])];

    dragPoints?.forEach((dragPoint, idx) => {
      resPoints[idx] = dragPoint ?? resPoints[idx];
    });

    return {
      ...(linkModels[model]?.render({ from, to, points: resPoints }) ??
        EMPTYDATA),
      drag: !!dragPoints?.length || linkId === DRAFT_ID
    };
  }, [dragPoints, from, linkId, model, points, to]);
}
