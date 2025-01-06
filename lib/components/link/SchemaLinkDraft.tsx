import { useAtomValue } from 'jotai';
import { FC } from 'react';

import { draftLinkAtom } from '../../context/dragNodePosition.context';
import { useSlotPosition } from '../../hooks/usePosition';

import { LinkPath } from './LinkPath';
import { DRAFT_ID } from './useLinkPath';

export const SchemaLinkDraft: FC = () => {
  const draftLink = useAtomValue(draftLinkAtom);
  const { from, to } = draftLink ?? {};

  const fromSlot = useSlotPosition(from?.id, 'out') ?? from?.rect;
  const toSlot = useSlotPosition(to?.id, 'in') ?? to?.rect;

  if (!fromSlot || !toSlot) return undefined;

  return (
    <LinkPath
      fromSlot={fromSlot}
      handle={false}
      id={DRAFT_ID}
      lineType="schema-editor__link--drag"
      toSlot={toSlot}
    />
  );
};

SchemaLinkDraft.displayName = 'SchemaLinkDraft';
