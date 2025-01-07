/* eslint-disable jsx-a11y/no-static-element-interactions */

/* eslint-disable jsx-a11y/click-events-have-key-events */
import cn from 'classnames';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { FC, MouseEventHandler, memo, useCallback, useRef } from 'react';

import { showNavigatorAtom } from 'lib/context/config.context';

import { canvasPositionAtom } from '../context/canvasPosition.context';
import { canvasSizeAtom } from '../context/canvasSize.context';
import { dragginModeAtom } from '../context/draggingMode.context';
import { methodsAtom } from '../context/methods.context';
import {
  selectBySelectBoxAtom,
  selectboxRectAtom
} from '../context/selectboxRect.context';
import { selectedNodeAtom } from '../context/selected.context';
import { useResize } from '../hooks/useResize';
import {
  EDraggingMode,
  EMouseButton,
  Position,
  SchemaEditorConfig,
  SchemaEditorData,
  SchemaEditorNode
} from '../models';
import { isEqual } from '../utils/isEqual';

import { CanvasMover } from './CanvasMover';
import './SchemaEditor.scss';
import { DragItem, DragItemProps, DragOptions } from './drag/DragItem';
import { Dragger } from './drag/Dragger';
import { SchemaLink } from './link/SchemaLink';
import { SchemaLinkDraft } from './link/SchemaLinkDraft';
import { Navigator } from './navigator/Navigator';
import { SchemaNode } from './node/SchemaNode';
import { SelectBox } from './selectbox/SelectBox';

interface SchemaEditorCanvasProps {
  data?: SchemaEditorData;
  children: FC<SchemaEditorNode>;
}

const DRAG_CANVAS_OPTIONS: DragOptions = {
  conditions: [
    {
      button: [EMouseButton.left],
      target: ['__self', 'schema-editor__drag']
    },
    {
      button: [EMouseButton.middle]
    }
  ],
  delay: 100
};

export const SchemaEditorCanvas: FC<SchemaEditorCanvasProps> = memo((props) => {
  const { data, children } = props;

  const showNavigator = useAtomValue(showNavigatorAtom);

  const ref = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  useResize({ ref, onResize: useSetAtom(canvasSizeAtom) });

  const setCanvasPosition = useSetAtom(canvasPositionAtom);
  const setSelectboxRect = useSetAtom(selectboxRectAtom);
  const selectBySelectBox = useSetAtom(selectBySelectBoxAtom);
  const [draggingMode, setDraggingMode] = useAtom(dragginModeAtom);
  const { onChangeConfig, onSelect } = useAtomValue(methodsAtom) ?? {};

  // const selectboxRect = useAtomValue(selectboxRectAtom);

  const positionRef = useRef<Position>();

  const stateRef = useRef<{
    originCanvasPos?: Position;
    onStartDragCanvas: DragItemProps['dragStart'];
    onDraggingCanvas: DragItemProps['dragMove'];
    onEndDragCanvas: DragItemProps['dragEnd'];
    onChangeConfig?: (data: Partial<SchemaEditorConfig>) => void;
    draggingMode: EDraggingMode;
    // canvasPosition: Position;
  }>({
    draggingMode,
    originCanvasPos: undefined,
    onStartDragCanvas: (e) => {
      if ((e.e as MouseEvent).button === EMouseButton.middle) {
        stateRef.current.originCanvasPos = positionRef.current; // stateRef.current.position;
        setDraggingMode(EDraggingMode.canvas);
      } else {
        setDraggingMode(EDraggingMode.selection);
      }
    },
    onDraggingCanvas: (e) => {
      e.e.preventDefault();
      const { originCanvasPos, draggingMode } = stateRef.current;
      if (draggingMode === EDraggingMode.canvas) {
        if (originCanvasPos) {
          const canvasPosition = {
            x: originCanvasPos.x + (e.dPos?.canvas?.x ?? 0),
            y: originCanvasPos.y + (e.dPos?.canvas?.y ?? 0)
          };
          setCanvasPosition(canvasPosition);
        }
      } else if (draggingMode === EDraggingMode.selection) {
        const { origin, dPos } = e;
        if (dPos) {
          setSelectboxRect({
            x: origin.canvas.x + (dPos.canvas.x < 0 ? dPos.canvas.x : 0),
            y: origin.canvas.y + (dPos.canvas.y < 0 ? dPos.canvas.y : 0),
            width: Math.abs(dPos.canvas.x),
            height: Math.abs(dPos.canvas.y)
          });
        }
      }
    },
    onEndDragCanvas: (e) => {
      e.e.preventDefault();
      setTimeout(() => setDraggingMode(EDraggingMode.none));
      const { originCanvasPos, draggingMode } = stateRef.current;

      if (draggingMode === EDraggingMode.canvas) {
        if (originCanvasPos) {
          delete stateRef.current.originCanvasPos;
          stateRef.current.onChangeConfig?.({
            canvasPosition: {
              x: originCanvasPos.x + (e.dPos?.canvas?.x ?? 0),
              y: originCanvasPos.y + (e.dPos?.canvas?.y ?? 0)
            }
          });
        }
      } else if (draggingMode === EDraggingMode.selection) {
        selectBySelectBox?.(e);
        setSelectboxRect(undefined);
      }
    },
    onChangeConfig
  });
  Object.assign(stateRef.current, { onChangeConfig, draggingMode });

  const { onDraggingCanvas, onEndDragCanvas, onStartDragCanvas } =
    stateRef.current;

  const [selected, setSelected] = useAtom(selectedNodeAtom);

  const clearSelected = useCallback<MouseEventHandler>(
    (e) => {
      if (
        draggingMode === EDraggingMode.none &&
        !isEqual(selected, []) &&
        !e.ctrlKey
      ) {
        setSelected([]);
        onSelect?.([]);
      }
    },
    [onSelect, draggingMode, selected, setSelected]
  );

  const links = data?.links ?? [];
  const nodes = data?.nodes ?? [];

  return (
    <>
      <Dragger dragRef={ref} />
      <DragItem
        dragEnd={onEndDragCanvas}
        dragMove={onDraggingCanvas}
        dragOptions={DRAG_CANVAS_OPTIONS}
        dragStart={onStartDragCanvas}
        itemRef={ref}
      />
      <CanvasMover
        canvasRef={canvasRef}
        dragRef={ref}
        positionRef={positionRef}
      />
      <div
        ref={ref}
        className={cn('schema-editor__canvas', {
          'schema-editor__canvas--dragging': [
            EDraggingMode.canvas,
            EDraggingMode.item,
            EDraggingMode.point
          ].includes(draggingMode)
        })}
        onClick={clearSelected}
      >
        <div className="schema-editor__drag" ref={canvasRef}>
          {nodes.map((node) => (
            <SchemaNode data={node} key={node.id}>
              {children}
            </SchemaNode>
          ))}
          {links.map((link) => (
            <SchemaLink data={link} key={link.id} />
          ))}
          <SchemaLinkDraft />
        </div>
        {draggingMode === EDraggingMode.selection && <SelectBox />}
        {showNavigator !== false && <Navigator data={data} />}
      </div>
    </>
  );
});

SchemaEditorCanvas.displayName = 'SchemaEditorCanvas';
