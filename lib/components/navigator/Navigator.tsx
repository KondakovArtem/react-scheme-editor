import { FC, MutableRefObject, useEffect, useMemo, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import style from "./Navigator.module.scss";
import {
  EDraggingMode,
  Position,
  SchemaEditorData,
  SchemaEditorNode,
} from "../../models";
import { DragItem } from "../drag/DragItem";
import { IDraggingEvent, IDragItem, subCoords } from "../drag/Dragger";
import { methodsAtom } from "../../context/methods.context";
import {
  updateViewportParams,
  updateMapParams,
  ViewportParams,
  MapParams,
  MAP_MAX_SIZE,
  MAP_MIN_SIZE,
  DragViewport,
  renderMap,
  NavigatorColors,
} from "./helpers";

import { NodeRects, nodeRectsAtom } from "../../context/rects.context";

import { canvasPositionAtom } from "../../context/canvasPosition.context";
import { zoomAtom } from "../../context/zoom.context";
import { canvasSizeAtom } from "../../context/canvasSize.context";
import { dragginModeAtom } from "../../context/draggingMode.context";
import { selectedNodeAtom } from "../../context/selected.context";

interface NavigatorProps {
  data?: SchemaEditorData;
}

export const Navigator: FC<NavigatorProps> = ({ data }) => {
  const canvasSize = useAtomValue(canvasSizeAtom);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [canvasPosition, setCanvasPosition] = useAtom(canvasPositionAtom);
  const rects = useAtomValue(nodeRectsAtom);
  const zoom = useAtomValue(zoomAtom);
  const selected = useAtomValue(selectedNodeAtom);

  const showMap = true;

  const { onChangeConfig } = useAtomValue(methodsAtom) ?? {};
  const [draggingMode, setDraggingMode] = useAtom(dragginModeAtom);

  const classes = useMemo(
    () =>
      [
        style.container,
        !showMap ? "collapsed" : "",
        draggingMode === EDraggingMode.navigator ? style.active : "",
      ].join(" "),
    [draggingMode, showMap]
  );

  const colorRef = useRef<NavigatorColors | undefined>();

  useEffect(() => {
    const { current: canvas } = canvasRef;
    if (canvas) {
      const canvasComputedStyle = getComputedStyle(canvas);
      colorRef.current = {
        mapBg: canvasComputedStyle.getPropertyValue(
          "--schema-editor-navigator-map-bg"
        ),
        mapStroke: canvasComputedStyle.getPropertyValue(
          "--schema-editor-navigator-map-stroke"
        ),
      };
    }
  }, [canvasRef]);

  useEffect(() => {
    if (canvasPosition && zoom) {
      viewportParamsRef.current = updateViewportParams(
        canvasSize,
        canvasPosition,
        zoom,
        data,
        rects,
        scrollSizeKRef.current
      );
      mapParamsRef.current = updateMapParams(viewportParamsRef.current);
      methodsRef.current.renderMap(data, rects, selected);
    }
  }, [zoom, canvasPosition, rects, data, canvasSize, selected]);

  useEffect(() => methodsRef.current.renderMap(data, rects), [data, rects]);

  const viewportParamsRef = useRef<ViewportParams>({
    minPos: { x: 0, y: 0 },
    maxPos: { x: 0, y: 0 },
    size: { width: 0, height: 0 },
    pos: { x: 0, y: 0 },
    zoom: 1,
    virtualViewportPosition: { x: 0, y: 0 },
    virtualViewportSize: { width: 0, height: 0 },
  });

  const mapParamsRef = useRef<MapParams>({
    sizeK: 1,
    mapSize: { width: 0, height: 0 },
    mapPosition: { x: 0, y: 0 },
    framePosition: { x: 0, y: 0 },
    frameSize: { width: 0, height: 0 },
  });
  const dragViewportRef = useRef<DragViewport | undefined>();

  const methodsRef: MutableRefObject<{
    renderMap: (
      data?: SchemaEditorData,
      rects?: NodeRects,
      selected?: SchemaEditorNode["id"][]
    ) => void;
    updatePositionByMap: (e: IDraggingEvent) => undefined | Position;
    mapDragStart: IDragItem["dragStart"];
    mapDragMove: IDragItem["dragMove"];
    mapDragEnd: IDragItem["dragEnd"];
  }> = useRef({
    renderMap: (data, rects, selected?) =>
      renderMap(data, rects, {
        dragViewport: dragViewportRef.current,
        mapParams: mapParamsRef.current,
        viewportParams: viewportParamsRef.current,
        canvas: canvasRef.current,
        colors: colorRef.current,
        selected,
      }),

    updatePositionByMap: (e) => {
      const { mapParams, viewportParams } = dragViewportRef.current ?? {};
      if (mapParams) {
        const mapCanvasRect = canvasRef.current?.getBoundingClientRect();
        if (mapCanvasRect && mapParams && viewportParams) {
          const { mapPosition, frameSize, sizeK } = mapParams;
          const { minPos, zoom } = viewportParams;
          const mapStartPoint = subCoords(e.origin.handler, mapCanvasRect);
          const mapViewportPos = {
            x: mapStartPoint.x + (e.dPos?.handler.x ?? 0) - frameSize.width / 2,
            y:
              mapStartPoint.y + (e.dPos?.handler.y ?? 0) - frameSize.height / 2,
          };

          const viewportPos = {
            x: -((mapViewportPos.x - mapPosition.x) / sizeK + minPos.x) * zoom,
            y: -((mapViewportPos.y - mapPosition.y) / sizeK + minPos.y) * zoom,
          };

          dragViewportRef.current &&
            (dragViewportRef.current.mapViewport = mapViewportPos);

          setCanvasPosition?.(viewportPos);
          return viewportPos;
        }
      }
    },
    mapDragStart: (e) => {
      setDraggingMode(EDraggingMode.navigator);
      dragViewportRef.current = {
        viewportParams: { ...viewportParamsRef.current },
        mapParams: { ...mapParamsRef.current },
      };
      methodsRef.current.updatePositionByMap(e);
    },
    mapDragMove: (e) => methodsRef.current.updatePositionByMap(e),
    mapDragEnd: (event) => {
      setTimeout(() => setDraggingMode(EDraggingMode.none));
      const canvasPosition = methodsRef.current.updatePositionByMap(event);
      canvasPosition && onChangeConfig?.({ canvasPosition });
      delete dragViewportRef.current;
    },
  });

  const scrollSizeKRef = useRef<Position>({ x: 1, y: 1 });

  const mapSize = useMemo(
    () => ({
      width: `${(!showMap ? MAP_MIN_SIZE : MAP_MAX_SIZE).width}px`,
      height: `${(!showMap ? MAP_MIN_SIZE : MAP_MAX_SIZE).height}px`,
    }),
    [showMap]
  );

  return (
    <div className={classes}>
      {/* <div class="flex">
      <div class="flex gap-1">
          <button
              pButton
              [icon]="!showMap ? 'pi pi-window-maximize' : 'pi pi-window-minimize'"
              class="show-map-switcher p-button-sm p-button-outlined p-button-secondary"
              (click)="onCollapseButtonClick()"
          ></button>
          <button
              class="hand-button p-button p-button-sm p-button-outlined p-button-secondary"
              [ngClass]="{
                  'hand-button-active': isCanvasInDragMode
              }"
              (click)="onHandButtonClick()"
          >
              <svg
                  class="hand-button-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
              >
                  <path
                      d="M11.4075 7.7265V4.17094C11.4075 3.80825 11.5522 3.46042 11.8097 3.20396C12.0672 2.9475 12.4165 2.80342 12.7807 2.80342C13.1449 2.80342 13.4942 2.9475 13.7517 3.20396C14.0092 3.46042 14.1539 3.80825 14.1539 4.17094V9.91453C14.1539 10.6329 14.0118 11.3442 13.7358 12.0078C13.4597 12.6715 13.0551 13.2745 12.5451 13.7825C12.035 14.2904 11.4295 14.6933 10.7631 14.9682C10.0967 15.2431 9.38243 15.3846 8.66111 15.3846C5.62753 15.3846 4.26689 13.7436 2.03074 9.04523C1.9404 8.8897 1.88171 8.71796 1.85805 8.53983C1.83439 8.3617 1.84621 8.18067 1.89283 8.0071C1.93946 7.83352 2.01998 7.67079 2.12978 7.52822C2.23959 7.38564 2.37653 7.26602 2.53279 7.17618C2.68904 7.08633 2.86154 7.02804 3.04043 7.00462C3.21932 6.98121 3.40109 6.99313 3.57535 7.03971C3.74961 7.08628 3.91294 7.16661 4.05602 7.27608C4.19909 7.38555 4.3191 7.52203 4.40918 7.67771L5.91472 10.2746V3.07693C5.91472 2.71424 6.05939 2.3664 6.31692 2.10994C6.57444 1.85348 6.92372 1.7094 7.28791 1.7094C7.65211 1.7094 8.00138 1.85348 8.25891 2.10994C8.51643 2.3664 8.66111 2.71424 8.66111 3.07693V7.7265"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                  />
                  <path
                      d="M11.4075 7.7265V1.98291C11.4075 1.62022 11.2628 1.27238 11.0053 1.01592C10.7478 0.759465 10.3985 0.615387 10.0343 0.615387C9.67011 0.615387 9.32083 0.759465 9.06331 1.01592C8.80578 1.27238 8.66111 1.62022 8.66111 1.98291V7.7265"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                  />
              </svg>
          </button>
      </div>
      <div class="flex flex-1 gap-1 justify-content-end align-items-baseline">
          <span class="ml-4">
              {{ zoomValue$ | async }}
          </span>
          <button
              pButton
              (click)="zoomIn()"
              icon="pi pi-search-plus"
              class="p-button-sm p-button-outlined p-button-secondary"
          ></button>
          <button
              pButton
              (click)="zoomOut()"
              icon="pi pi-search-minus"
              class="p-button-sm p-button-outlined p-button-secondary"
          ></button>
          <button
              pButton
              (click)="zoomReset()"
              icon="pi pi-refresh"
              class="p-button-sm p-button-outlined p-button-secondary"
          ></button>
      </div>
  </div>*/}
      <DragItem
        itemRef={canvasRef}
        dragStart={methodsRef.current.mapDragStart}
        dragMove={methodsRef.current.mapDragMove}
        dragEnd={methodsRef.current.mapDragEnd}
      >
        <canvas
          onClick={(e) => e.stopPropagation()}
          width={mapSize.width}
          height={mapSize.height}
          ref={canvasRef}
          style={mapSize}
          className={style.mapCanvas}
        ></canvas>
      </DragItem>
    </div>
  );
};
