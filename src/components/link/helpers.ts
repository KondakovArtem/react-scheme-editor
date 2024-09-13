import { toPath } from "svg-points";
import {
  TangentDirections,
  Position,
  TRect,
  ARROW_WIDTH,
  SchemaEditorLinkModel,
  ESchemaEditorLinkModels,
  SlotRect,
} from "../../models";
import { Point } from "../../utils/point";
import { Rect } from "../../utils/rect";
import { curveLink } from "../../utils/curve-link";

function getVisualDirectionFrom(): TangentDirections {
  return (
    // (this.link?.from && this.editor.getSlot(this.link.from)?.visualDirection) ||
    // (this.nodeLinkDraft?.from.slotId &&
    //     this.editor.getSlot(this.nodeLinkDraft?.from.slotId)?.visualDirection) ||
    TangentDirections.AUTO
  );
}

function getVisualDirectionTo(): TangentDirections {
  return (
    // (this.link?.to && this.editor.getSlot(this.link.to)?.visualDirection) ||
    // (this.nodeLinkDraft?.to.slotId &&
    //     this.editor.getSlot(this.nodeLinkDraft?.to.slotId)?.visualDirection) ||
    TangentDirections.AUTO
  );
}

function getAveragePoint(edgePoint: Point, shiftedPoint: Point): Point {
  return new Point(
    Math.round((edgePoint.x + shiftedPoint.x) / 2),
    Math.round((edgePoint.y + shiftedPoint.y) / 2)
  );
}

function convertToAbsPoint(rect: Rect, { x, y }: Position): Position {
  if (!rect) throw new Error("Missing relative rect");
  return { x: x + rect.x, y: y + rect.y };
}

export function convertToRelativePoint(
  rect: Rect,
  { x, y }: Position
): Position {
  if (!rect) throw new Error("Missing relative rect");
  return { x: x - rect.x, y: y - rect.y };
}

/** Метод convertToAbsPoints преобразует массив точек в абсолютные координаты относительно двух прямоугольников
 * (fromRect и toRect). Он проверяет наличие прямоугольников и выбрасывает ошибку, если они отсутствуют.
 * Для первой точки в массиве, координаты преобразуются относительно fromRect, а для последней — относительно toRect.
 * Остальные точки остаются неизменными */
// function convertToAbsPoints(
//   fromRect: Rect,
//   toRect: Rect,
//   points: Position[]
// ): Position[] {
//   if (!fromRect || !toRect) throw new Error("Missing From To Rects");
//   return points.map((point, idx) => {
//     if (!idx) return convertToAbsPoint(fromRect, point);
//     if (idx === points.length - 1) return convertToAbsPoint(toRect, point);
//     return point;
//   });
// }

export function generatePoints(
  fromRect: SlotRect,
  toRect: SlotRect,
  points?: Position[]
) {
  if (!fromRect || !toRect) return undefined;
  const fromD = new Rect(fromRect);
  const toD = new Rect(toRect);
  const vdFrom = fromRect.directions; // getVisualDirectionFrom(fromRect.directions);
  const vdTo = toRect.directions; // getVisualDirectionTo(toRect.directions);

  points = [...(points ?? [])];

  let firstPoint = points.shift();
  let lastPoint = points.pop();

  const fromPoints = fromD.getRelevantSidePoints(
    vdFrom,
    firstPoint ? new Point(convertToAbsPoint(fromD, firstPoint)) : toD.center(),
    ARROW_WIDTH
  );

  const toPoints = toD.getRelevantSidePoints(
    vdTo,
    lastPoint ? new Point(convertToAbsPoint(toD, lastPoint)) : fromD.center(),
    ARROW_WIDTH
  );

  return {
    start: getAveragePoint(fromPoints.point, fromPoints.shiftedPoint),
    end: getAveragePoint(toPoints.point, toPoints.shiftedPoint),
    points: [fromPoints.shiftedPoint, toPoints.shiftedPoint],
  };

  // if (!points?.length) {
  //   const toPoints = toD.getRelevantSidePoints(
  //     vdTo,
  //     new Point(fromPoints.shiftedPoint),
  //     ARROW_WIDTH
  //   );
  //   return {
  //     start: getAveragePoint(fromPoints.point, fromPoints.shiftedPoint),
  //     end: getAveragePoint(toPoints.point, toPoints.shiftedPoint),
  //     points: [fromPoints.shiftedPoint, toPoints.shiftedPoint],
  //   };
  // } else {
  //   const pathPoints = convertToAbsPoints(fromD, toD, points);
  //   const fromPoints = fromD.getRelevantSidePoints(
  //     vdFrom,
  //     new Point(pathPoints[0]),
  //     ARROW_WIDTH
  //   );
  //   const toPoints = toD.getRelevantSidePoints(
  //     vdTo,
  //     new Point(pathPoints[pathPoints.length - 1]),
  //     ARROW_WIDTH
  //   );
  //   pathPoints[0] = fromPoints.shiftedPoint;
  //   pathPoints[pathPoints.length - 1] = toPoints.shiftedPoint;

  //   return {
  //     start: getAveragePoint(fromPoints.point, fromPoints.shiftedPoint),
  //     end: getAveragePoint(toPoints.point, toPoints.shiftedPoint),
  //     points: pathPoints,
  //   };
  // }
}

export function updatePath(
  fromRect: SlotRect,
  toRect: SlotRect,
  pathPoints: Position[]
) {
  const points = pathPoints.map((point) => new Point(point));
  const sourceDirection = fromRect.directions[0];
  const targetDirection = toRect.directions[0];
  let newPath = "";
  if (points.length) {
    newPath = toPath(
      curveLink(
        points,
        {
          sourceDirection,
          targetDirection,
          tension: 0.6,
        },
        {
          sourceBBox: new Rect(fromRect),
          targetBBox: new Rect(toRect),
        }
      ).flatMap((curve, idx) => curve.toSvgPoints(!idx))
    );
  }
  if (newPath.includes('NaN')) {
    debugger;
  }
  return newPath;

  //   if (newPath !== this.path) {
  //     const pathHandleEl = this.pathHandleRef.nativeElement;
  //     const pathEl = this.pathRef.nativeElement;
  //     this.path = newPath;

  //     if (newPath) {
  //       pathEl.setAttributeNS(null, "d", newPath);
  //       pathHandleEl.setAttributeNS(null, "d", newPath);
  //     } else {
  //       pathEl.removeAttributeNS(null, "d");
  //       pathHandleEl.removeAttributeNS(null, "d");
  //     }
  //     this.cdr.detectChanges();
  //   }
}

export const linkModels: {
  [keys in ESchemaEditorLinkModels]?: SchemaEditorLinkModel;
} = {
  [ESchemaEditorLinkModels.curve]: {
    render: ({ from, to, points }) => {
      const pointsData = generatePoints(from, to, points);
      if (pointsData) {
        return {
          path: updatePath(from, to, pointsData?.points),
          points: pointsData.points,
        };
      }
      return {
        path: "",
        points: [],
      };
    },
    onDrag: ({ event, from, pointIndex, points, to, originPoint }) => {
      const { dPos } = event;
      if (dPos) {
        const dragP = new Point({
          x: originPoint.x + dPos.scale.x,
          y: originPoint.y + dPos.scale.y,
        });
        const count = points.length;
        points = [];

        if (pointIndex === 0) {
          const fromD = Rect.from(from);
          const fromPoints = fromD.getRelevantSidePoints(
            from.directions,
            dragP,
            ARROW_WIDTH
          );
          points[pointIndex] = fromPoints.point.relative(from).toJson();
        }
        //
        else if (pointIndex === count - 1) {
          const toD = Rect.from(to);
          const toPoints = toD.getRelevantSidePoints(
            to.directions,
            dragP,
            ARROW_WIDTH
          );
          points[pointIndex] = toPoints.point.relative(to).toJson();
        } else {
          points[pointIndex] = dragP.toJson();
        }
      }
      return points;
    },
  },
};
