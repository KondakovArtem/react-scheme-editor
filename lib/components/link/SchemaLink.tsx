import { useSetAtom } from 'jotai';
import { FC, MouseEvent, memo, useCallback, useRef, useState } from 'react';

import {
  onClickElementAtom,
  selectedNodeAtom
} from '../../context/selected.context';
import { useMouseDown } from '../../hooks/useMouseDown';
import { useSlotPosition } from '../../hooks/usePosition';
import {
  ESchemaEditorLinkModels,
  type SchemaEditorNodeLink
} from '../../models';
import { useSelectAtomValue } from '../../utils/atom.selector';

import { LinkPath } from './LinkPath';

export interface SchemaEditorLinkProps {
  data: SchemaEditorNodeLink;
  showPoints?: boolean;
  selected?: boolean;
}

export const SchemaLink: FC<SchemaEditorLinkProps> = memo(({ data }) => {
  const pathHandleRef = useRef<SVGPathElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const { from, to, id, model = ESchemaEditorLinkModels.curve } = data;

  const fromSlot = useSlotPosition(from, 'out');
  const toSlot = useSlotPosition(to, 'in');

  const [hover, setHover] = useState(false);

  const active = useSelectAtomValue(
    selectedNodeAtom,
    (selected) => selected?.includes(id),
    [id]
  );

  const onClickElement = useSetAtom(onClickElementAtom);

  const onLinkClick = useCallback(
    (e: MouseEvent) => {
      console.log('onLinkClick', id);
      onClickElement({ e, ids: [id] });
      e.stopPropagation();
    },
    [id, onClickElement]
  );

  const onLinkDblClick = () => {
    console.log('onLinkDblClick');
  };
  const onLinkContextMenu = () => {
    console.log('onLinkContextMenu');
  };

  const mouseOver = useCallback(() => setHover(true), []);
  const mouseOut = useCallback(() => setHover(false), []);

  useMouseDown<SVGPathElement>({
    ref: pathHandleRef,
    onMouseDown: useCallback((e) => e.stopPropagation(), [])
  });

  if (!fromSlot || !toSlot) return undefined;

  return (
    <LinkPath
      active={active}
      fromArrow={data.fromArrow}
      fromSlot={fromSlot}
      hover={hover}
      id={id}
      lineType={data.lineType}
      model={model}
      mouseOut={mouseOut}
      mouseOver={mouseOver}
      pathHandleRef={pathHandleRef}
      pathRef={pathRef}
      points={data.points}
      toArrow={data.toArrow}
      toSlot={toSlot}
      onClick={onLinkClick}
      onContextMenu={onLinkContextMenu}
      onDoubleClick={onLinkDblClick}
    />
  );
});

SchemaLink.displayName = 'SchemaLink';
