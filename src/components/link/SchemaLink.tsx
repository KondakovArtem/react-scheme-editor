import { FC, memo, useCallback, useRef, useState, MouseEvent } from "react";
import { useSetAtom } from "jotai";

import {
  ESchemaEditorLinkModels,
  type SchemaEditorNodeLink,
} from "../../models";

import {
  onClickElementAtom,
  selectedNodeAtom,
} from "../../context/selected.context";
import { useSelectAtomValue } from "../../utils/atom.selector";
import { useMouseDown } from "../../hooks/useMouseDown";
import { useSlotPosition } from "../../hooks/usePosition";
import { LinkPath } from "./LinkPath";

export interface SchemaEditorLinkProps {
  data: SchemaEditorNodeLink;
  showPoints?: boolean;
  selected?: boolean;
}

export const SchemaLink: FC<SchemaEditorLinkProps> = memo(({ data }) => {
  const pathHandleRef = useRef<SVGPathElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const { from, to, id, model = ESchemaEditorLinkModels.curve } = data;

  const fromSlot = useSlotPosition(from, "out");
  const toSlot = useSlotPosition(to, "in");

  const [hover, setHover] = useState(false);
  const active = useSelectAtomValue(
    selectedNodeAtom,
    (selected) => selected?.includes(id),
    [id]
  );

  const onClickElement = useSetAtom(onClickElementAtom);

  const onLinkClick = useCallback(
    (e: MouseEvent) => {
      console.log("onLinkClick", id);
      onClickElement({ e, ids: [id] });
      e.stopPropagation();
    },
    [id, onClickElement]
  );

  function onLinkDblClick() {
    console.log("onLinkDblClick");
  }
  function onLinkContextMenu() {
    console.log("onLinkContextMenu");
  }

  const mouseOver = useCallback(() => setHover(true), []);
  const mouseOut = useCallback(() => setHover(false), []);

  useMouseDown<SVGPathElement>({
    ref: pathHandleRef,
    onMouseDown: useCallback((e: MouseEvent) => e.stopPropagation(), []),
  });

  return (
    <>
      {fromSlot && toSlot && (
        <LinkPath
          id={id}
          fromSlot={fromSlot}
          toSlot={toSlot}
          hover={hover}
          active={active}
          model={model}
          fromArrow={data.fromArrow}
          toArrow={data.toArrow}
          points={data.points}
          mouseOver={mouseOver}
          mouseOut={mouseOut}
          pathRef={pathRef}
          pathHandleRef={pathHandleRef}
          lineType={data.lineType}
          onContextMenu={onLinkContextMenu}
          onClick={onLinkClick}
          onDoubleClick={onLinkDblClick}
        />
      )}
    </>
  );
});

SchemaLink.displayName = "SchemaLink";
