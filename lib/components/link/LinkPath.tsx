import cn from 'classnames';
import { FC, MouseEventHandler, MutableRefObject } from 'react';

import {
  ARROW_HEIGHT,
  ARROW_WIDTH,
  ESchemaEditorLinkModels,
  Position,
  SchemaEditorNodeLinkArrow,
  SlotRect
} from '../../models';

import './LinkPath.scss';
import { PointHandler } from './PointHandler';
import { arrows } from './arrows';
import { useLinkPath } from './useLinkPath';

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

export const LinkPath: FC<LinkProps> = ({
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
  points: pPoints
}) => {
  const markerStartId = `${id ?? 'unknown'}_start`;
  const markerEndId = `${id ?? 'unknown'}_end`;

  const { points, path, drag } = useLinkPath(
    fromSlot,
    toSlot,
    id,
    model,
    pPoints
  );

  return (
    <div
      className={cn('schema-editor__link', {
        'schema-editor__link--active': active,
        'schema-editor__link--hover': hover,
        'schema-editor__link--drag': drag
      })}
    >
      <svg style={{ display: path ? 'inherit' : 'none' }}>
        {handle && (
          <path
            className="schema-editor__link-handle"
            d={path}
            ref={pathHandleRef}
            onClick={onClick}
            onContextMenu={onContextMenu}
            onDoubleClick={onDoubleClick}
            onMouseOut={mouseOut}
            onMouseOver={mouseOver}
          ></path>
        )}
        <path
          className={cn('schema-editor__link-path', lineType)}
          d={path}
          markerEnd={`url(#${markerEndId})`}
          markerStart={`url(#${markerStartId})`}
          ref={pathRef}
        ></path>
        <defs>
          <marker
            className="arrow-marker"
            id={markerStartId}
            markerHeight={arrowHeight}
            markerUnits="userSpaceOnUse"
            markerWidth={arrowWidth}
            orient="auto-start-reverse"
            refX={refX}
            refY={refY}
            viewBox={ARROW_VIEW_BOX}
          >
            {arrows[fromArrow ?? SchemaEditorNodeLinkArrow.arrowNone]?.()}
          </marker>
          <marker
            className="arrow-marker"
            id={markerEndId}
            markerHeight={arrowHeight}
            markerUnits="userSpaceOnUse"
            markerWidth={arrowWidth}
            orient="auto-start-reverse"
            refX={refX}
            refY={refY}
            viewBox={ARROW_VIEW_BOX}
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
            from={fromSlot}
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            linkId={id}
            linkModel={model}
            pointIndex={i}
            points={points}
            to={toSlot}
            onMouseOut={mouseOut}
            onMouseOver={mouseOver}
          />
        ))}
    </div>
  );
};

LinkPath.displayName = 'LinkPath';
