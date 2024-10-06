import { NodeRects } from "../../context/rects.context";
import type {
  Position,
  Size,
  SchemaEditorData,
  SchemaEditorNode,
} from "../../models";

export interface ViewportParams {
  minPos: Position;
  maxPos: Position;
  /** viewport canvas size in real px */
  size: Size;
  /** viewport canvas position in real px */
  pos: Position;
  zoom: number;
  virtualViewportPosition: Position;
  virtualViewportSize: Size;
}

export interface MapParams {
  /** Коэффициент масштабирования, который используется
   * для приведения размеров виртуального пространства к размерам карты.
   * Он определяется как минимальное значение между коэффициентами по ширине
   * и высоте (widthK и heightK), чтобы сохранить пропорции и уместить всю
   * карту в заданные максимальные размеры (mapMaxSize). Это позволяет избежать
   * искажений и сохранить правильное соотношение сторон при отображении карты **/
  sizeK: number;
  mapSize: Size;
  mapPosition: Position;
  framePosition: Position;
  frameSize: Size;
}

export interface DragViewport {
  mapViewport?: Position;
  mapParams?: MapParams;
  viewportParams?: ViewportParams;
}

export interface NavigatorColors {
  mapBg: string;
  mapStroke: string;
}

export const MAP_MIN_SIZE: Size = { width: 0, height: 0 };
export const MAP_MAX_SIZE: Size = { width: 200, height: 200 };

/** Функция updateViewportParams предназначена для вычисления параметров виртуального вьюпорта на канвасе, 
 * основываясь на текущем масштабе, позиции и данных схемы. Она возвращает объект с параметрами, которые 
 * помогают правильно отобразить содержимое на канвасе. 
 * @var size: Размер видимой части канваса в пикселях.
   @var position: Сдвиг канваса в пикселях.
   @var zoom: Коэффициент масштабирования.
   @var data: Данные редактора схемы, содержащие узлы и связи.
   @var rects: Размеры прямоугольников узлов.
   @var scrollSizeK: Коэффициент масштабирования для прокрутки.

   @returns minPos и maxPos: Минимальная и максимальная позиции всех точек (узлы, связи, вьюпорт) в виртуальном пространстве.
   @returns size: Размер виртуального пространства, масштабированный с учётом текущего зума и прокрутки.
   @returns pos: Позиция виртуального вьюпорта относительно минимальной позиции всех точек.
   @returns zoom: Текущий коэффициент масштабирования.
   @returns virtualViewportPosition: Позиция виртуального вьюпорта.
   @returns virtualViewportSize: Размер виртуального вьюпорта.
 * 
 * */
export function updateViewportParams(
  size: Size | undefined,
  position: Position,
  zoom: number,
  data?: SchemaEditorData,
  rects?: NodeRects,
  scrollSizeK?: Position
) {
  const { width, height } = size ?? { width: 0, height: 0 }; // Visible part of canvas in real px
  const { x, y } = position; // Canvas shift in real px
  const virtualViewportPosition = {
    x: -Math.round(x / zoom),
    y: -Math.round(y / zoom),
  };
  const virtualViewportSize = {
    width: Math.round(width / zoom),
    height: Math.round(height / zoom),
  };

  const points: Position[] = [];
  data?.nodes?.forEach((node) => {
    points.push(node.position);
    const rect = rects?.[node.id];
    if (!rect) {
      return;
    }
    const { width: w, height: h } = rect;
    points.push({
      x: node.position.x + w,
      y: node.position.y + h,
    });
  });
  data?.links?.forEach((link) => {
    link.points?.forEach((point, index, array) => {
      if (index === 0 || index === array.length - 1) {
        return;
      }
      points.push(point);
    });
  });

  points.push(virtualViewportPosition, {
    x: virtualViewportPosition.x + virtualViewportSize.width,
    y: virtualViewportPosition.y + virtualViewportSize.height,
  });
  const result: ViewportParams = {
    minPos: {
      x: Math.min(...points.map(({ x }) => x)),
      y: Math.min(...points.map(({ y }) => y)),
    },
    maxPos: {
      x: Math.max(...points.map(({ x }) => x)),
      y: Math.max(...points.map(({ y }) => y)),
    },
    size: { width: 0, height: 0 },
    pos: { x: 0, y: 0 },

    // width: 0,
    // height: 0,
    // left: 0,
    // top: 0,
    zoom,
    virtualViewportPosition,
    virtualViewportSize,
  };

  result.size = {
    width: (result.maxPos.x - result.minPos.x) * zoom * (scrollSizeK?.x ?? 1),
    height: (result.maxPos.y - result.minPos.y) * zoom * (scrollSizeK?.y ?? 1),
  };
  result.pos = {
    x:
      (virtualViewportPosition.x - result.minPos.x) *
      zoom *
      (scrollSizeK?.x ?? 1),
    y:
      (virtualViewportPosition.y - result.minPos.y) *
      zoom *
      (scrollSizeK?.y ?? 1),
  };
  return result;
}

/** Функция updateMapParams предназначена для вычисления параметров
   *  отображения карты в определённой области, исходя из виртуальных
   *  координат и размеров. 
   *  @var minPos и maxPos: Определяют границы виртуального пространства.
   *  @var virtualViewportPosition: Позиция виртуального вьюпорта внутри виртуального пространства.
   *  @var virtualViewportSize: Размер виртуального вьюпорта.
   *  @returns sizeK: Коэффициент масштабирования, который определяет, как виртуальное пространство масштабируется, чтобы уместиться в максимальные размеры карты (mapMaxSize).
      @returns mapPosition: Позиция карты в пределах контейнера mapMaxSize.
      @returns mapSize: Размер карты после масштабирования.
      @returns framePosition: Позиция вьюпорта внутри карты.
      @returns frameSize: Размер вьюпорта на карте.
   * */
export function updateMapParams({
  minPos,
  maxPos,
  virtualViewportPosition,
  virtualViewportSize,
}: ViewportParams): MapParams {
  const virtualWidth = maxPos.x - minPos.x;
  const virtualHeight = maxPos.y - minPos.y;
  const widthK = MAP_MAX_SIZE.width / virtualWidth;
  const heightK = MAP_MAX_SIZE.height / virtualHeight;

  const sizeK: MapParams["sizeK"] = Math.min(widthK, heightK);

  const mapSize = {
    width: virtualWidth * sizeK,
    height: virtualHeight * sizeK,
  };

  const mapPosition = {
    x: (MAP_MAX_SIZE.width - mapSize.width) / 2,
    y: (MAP_MAX_SIZE.height - mapSize.height) / 2,
  };

  return {
    sizeK,
    mapPosition,
    mapSize,
    framePosition: {
      x: mapPosition.x + (virtualViewportPosition.x - minPos.x) * sizeK,
      y: mapPosition.y + (virtualViewportPosition.y - minPos.y) * sizeK,
    },
    frameSize: {
      width: virtualViewportSize.width * sizeK,
      height: virtualViewportSize.height * sizeK,
    },
  };
}

/**
 * Renders a map on a canvas element using provided data and node rectangles.
 *
 * @param data - Optional data containing nodes to be rendered.
 * @param rects - Optional mapping of node IDs to their rectangle dimensions.
 */
export function renderMap(
  data: SchemaEditorData | undefined,
  rects: NodeRects | undefined,
  opts: {
    dragViewport: DragViewport | undefined;
    canvas?: HTMLCanvasElement | null;
    mapParams: MapParams;
    viewportParams: ViewportParams;
    colors?: NavigatorColors;
    selected?: SchemaEditorNode["id"][];
  }
): void {
  // Get the current drag viewport and its map viewport.
  const { dragViewport, canvas } = opts ?? {};
  const { mapViewport } = dragViewport ?? {};

  // Get the canvas element and its 2D rendering context.
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Retrieve map and viewport parameters.
  const mapParams = dragViewport?.mapParams ?? opts?.mapParams;
  const viewportParams = dragViewport?.viewportParams ?? opts?.viewportParams;

  const { minPos } = viewportParams ?? {};
  const { mapPosition, sizeK, framePosition, frameSize } = mapParams ?? {};

  // Clear the canvas for fresh rendering.
  ctx.clearRect(0, 0, MAP_MAX_SIZE.width + 1, MAP_MAX_SIZE.height + 1);

  ctx.fillStyle = opts.colors?.mapBg ?? "#ffffff";
  ctx.strokeStyle = opts.colors?.mapStroke ?? "#aaaaaa";

  // Draw the map background and border.
  ctx.fillRect(
    mapViewport?.x ?? framePosition.x,
    mapViewport?.y ?? framePosition.y,
    frameSize.width,
    frameSize.height
  );
  ctx.strokeRect(
    mapViewport?.x ?? framePosition.x,
    mapViewport?.y ?? framePosition.y,
    frameSize.width,
    frameSize.height
  );

  // Render each node as a rectangle on the map.
  data?.nodes?.forEach(({ id }) => {
    const rect = rects?.[id];
    if (!rect) {
      return;
    }

    // Set base color for nodes.
    let nodeBaseColor = "#000000";

    if (opts.selected?.includes(id)) {
      nodeBaseColor = "#009900";
    }
    ctx.strokeStyle = nodeBaseColor;
    ctx.fillStyle = `${nodeBaseColor}40`;

    const { width, height, x, y } = rect;
    const rectX = mapPosition.x + (x - minPos.x) * sizeK;
    const rectY = mapPosition.y + (y - minPos.y) * sizeK;
    const rectW = width * sizeK;
    const rectH = height * sizeK;
    ctx.fillRect(rectX, rectY, rectW, rectH);
    ctx.strokeRect(rectX, rectY, rectW, rectH);
  });
}
