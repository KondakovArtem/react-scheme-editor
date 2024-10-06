import { FC, MouseEventHandler, MutableRefObject, useMemo } from "react";
import {
  ARROW_HEIGHT,
  ARROW_WIDTH,
  ESchemaEditorLinkModels,
  Position,
  SchemaEditorNodeLinkArrow,
  SlotRect,
} from "../../models";
import { arrows } from "./arrows";
import { PointHandler } from "./PointHandler";
import { useLinkPath } from "./useLinkPath";

import "./LinkPath.scss";

export interface LinkProps {
  id: string;
  active?: boolean;
  hover?: boolean;
  handle?: boolean;
  pathHandleRef?: MutableRefObject<SVGPathElement | null>;
  pathRef?: MutableRefObject<SVGPathElement | null>;
  mouseOver?: MouseEventHandler;
  mouseOut?: MouseEventHandler;
  onClick?: MouseEventHandler;
  onDoubleClick?: MouseEventHandler;
  onContextMenu?: MouseEventHandler;
  lineType?: string;
  fromArrow?: SchemaEditorNodeLinkArrow;
  toArrow?: SchemaEditorNodeLinkArrow;
  showPoints?: boolean;
  fromSlot: SlotRect;
  toSlot: SlotRect;
  points?: Position[];
  model?: ESchemaEditorLinkModels;
}

const arrowWidth = ARROW_WIDTH;
const arrowHeight = ARROW_HEIGHT;
const ARROW_VIEW_BOX = `0 0 ${ARROW_WIDTH} ${ARROW_HEIGHT}`;
const refX = 1;
const refY = ARROW_HEIGHT / 2;

export const LinkPath: FC<LinkProps> = (props) => {
  const {
    id,
    active,
    hover,
    handle = true,
    pathHandleRef,
    pathRef,
    mouseOver,
    mouseOut,
    onClick,
    onDoubleClick,
    onContextMenu,
    lineType,
    fromArrow,
    toArrow,
    showPoints = true,
    fromSlot,
    toSlot,
    model = ESchemaEditorLinkModels.curve,
  } = props;
  const markerStartId = `${id ?? "unknown"}_start`;
  const markerEndId = `${id ?? "unknown"}_end`;

  const classes = useMemo(
    () =>
      [
        "schema-editor__link",
        (active && "schema-editor__link--active") || "",
        (hover && "schema-editor__link--hover") || "",
      ].join(" "),
    [hover, active]
  );

  const { points, path } = useLinkPath(
    fromSlot,
    toSlot,
    props.points,
    id,
    model
  );

  return (
    <div className={classes}>
      <svg style={{ display: path ? "inherit" : "none" }}>
        {handle && (
          <path
            ref={pathHandleRef}
            className="schema-editor__link-handle"
            onMouseOver={mouseOver}
            onMouseOut={mouseOut}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onContextMenu={onContextMenu}
            d={path}
          ></path>
        )}
        <path
          ref={pathRef}
          className={["schema-editor__link-path", lineType ?? ""].join(" ")}
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
            {arrows[fromArrow ?? SchemaEditorNodeLinkArrow.arrowNone]?.()}
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
            {arrows[toArrow ?? SchemaEditorNodeLinkArrow.arrowDefault]?.()}
          </marker>
        </defs>
      </svg>
      {showPoints &&
        fromSlot &&
        toSlot &&
        points?.map((_, i) => (
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
};

LinkPath.displayName = "LinkPath";
