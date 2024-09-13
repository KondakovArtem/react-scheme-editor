import {
  FC,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  MouseEvent,
} from "react";
import { useSetAtom } from "jotai";

import {
  ARROW_HEIGHT,
  ARROW_WIDTH,
  ESchemaEditorLinkModels,
  SchemaEditorNodeLinkArrow,
  type SchemaEditorNodeLink,
  type SchemaEditorNodeLinkDraft,
} from "../../models";

import { arrows } from "./arrows";
import { PointHandler } from "./PointHandler";

import "./SchemaLink.scss";
import { useLinkPath } from "./useLinkPath";
import {
  onClickElementAtom,
  selectedNodeAtom,
} from "../../context/selected.context";
import { useSelectAtomValue } from "../../utils/atom.selector";
import { useMouseDown } from "../../hooks/useMouseDown";
import { useSlotPosition } from "../../hooks/usePosition";

export interface SchemaEditorLinkProps {
  data: SchemaEditorNodeLink;
  draft?: SchemaEditorNodeLinkDraft;
  showPoints?: boolean;
  selected?: boolean;
}

const arrowWidth = ARROW_WIDTH;
const arrowHeight = ARROW_HEIGHT;
const ARROW_VIEW_BOX = `0 0 ${ARROW_WIDTH} ${ARROW_HEIGHT}`;
const refX = 1;
const refY = ARROW_HEIGHT / 2;

export const SchemaLink: FC<SchemaEditorLinkProps> = memo(
  ({ data, showPoints = true }) => {
    const pathHandleRef = useRef<SVGPathElement | null>(null);
    const pathRef = useRef<SVGPathElement | null>(null);
    const { from, to, id, model = ESchemaEditorLinkModels.curve } = data;

    const markerStartId = `${id ?? "unknown"}_start`;
    const markerEndId = `${id ?? "unknown"}_end`;

    const fromSlot = useSlotPosition(from, "out");
    const toSlot = useSlotPosition(to, "in");

    const { points, path } = useLinkPath(
      fromSlot,
      toSlot,
      data.points,
      id,
      model
    );

    console.log("path=", path);
    console.log(toSlot?.x, toSlot?.y);

    const [hover, setHover] = useState(false);
    const active = useSelectAtomValue(
      selectedNodeAtom,
      (selected) => selected?.includes(id),
      [id]
    );

    const classes = useMemo(
      () =>
        [
          "schema-editor__link",
          (active && "schema-editor__link--active") || "",
          (hover && "schema-editor__link--hover") || "",
        ].join(" "),
      [hover, active]
    );

    const onClickElement = useSetAtom(onClickElementAtom);

    const onLinkClick = useCallback((e: MouseEvent) => {
      console.log("onLinkClick", id);
      onClickElement({ e, ids: [id] });
      e.stopPropagation();
    }, []);
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
      <div className={classes}>
        <svg style={{ display: path ? "inherit" : "none" }}>
          <path
            ref={pathHandleRef}
            className="schema-editor__link-handle"
            onMouseOver={mouseOver}
            onMouseOut={mouseOut}
            onClick={onLinkClick}
            onDoubleClick={onLinkDblClick}
            onContextMenu={onLinkContextMenu}
            d={path}
          ></path>
          <path
            ref={pathRef}
            className={[
              "schema-editor__link-path",
              data?.lineType === "dashed" ? "dashed" : "",
            ].join(" ")}
            markerStart={`url(#${markerStartId})`}
            markerEnd={`url(#${markerEndId})`}
            d={path}
          ></path>
          <defs>
            <marker
              id={markerStartId}
              markerWidth={arrowWidth}
              markerHeight={arrowHeight}
              markerUnits="userSpaceOnUse"
              refX={refX}
              refY={refY}
              orient="auto-start-reverse"
              viewBox={ARROW_VIEW_BOX}
              className="arrow-marker"
            >
              {arrows[
                data.fromArrow ?? SchemaEditorNodeLinkArrow.arrowNone
              ]?.()}
            </marker>
            <marker
              id={markerEndId}
              markerWidth={arrowWidth}
              markerHeight={arrowHeight}
              markerUnits="userSpaceOnUse"
              refX={refX}
              refY={refY}
              orient="auto-start-reverse"
              viewBox={ARROW_VIEW_BOX}
              className="arrow-marker"
            >
              {arrows[
                data.toArrow ?? SchemaEditorNodeLinkArrow.arrowDefault
              ]?.()}
            </marker>
          </defs>
        </svg>
        {showPoints &&
          fromSlot &&
          toSlot &&
          points.map((_, i) => (
            <PointHandler
              onMouseOver={mouseOver}
              onMouseOut={mouseOut}
              key={i}
              points={points}
              pointIndex={i}
              linkModel={model}
              linkId={id}
              from={fromSlot}
              to={toSlot}
            ></PointHandler>
          ))}
      </div>
    );
  }
);

SchemaLink.displayName = "SchemaLink";
