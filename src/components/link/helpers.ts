import { toPath } from "svg-points";
import { TangentDirections, Position, TRect, ARROW_WIDTH } from "../../models";
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

function getEdgeHandlerPoint(edgePoint: Point, shiftedPoint: Point): Point {
  const x = Math.round((edgePoint.x + shiftedPoint.x) / 2);
  const y = Math.round((edgePoint.y + shiftedPoint.y) / 2);
  return new Point(x, y);
}

function convertToAbsPoints(
  fromRect: Rect,
  toRect: Rect,
  points: Position[]
): Position[] {
  if (!fromRect || !toRect) throw new Error("Missing From To Rects");

  return points.map(({ x, y }, idx) => {
    if (!idx) return { x: x + fromRect.left, y: y + fromRect.top };
    if (idx === points.length - 1)
      return { x: x + toRect.left, y: y + toRect.top };
    return { x, y };
  });
}

export function generatePoints(
  fromRect: TRect,
  toRect: TRect,
  points?: Position[]
) {
  //   setPoints([]);
  if (!fromRect || !toRect) return undefined;
  const fromD = new Rect(fromRect);
  const toD = new Rect(toRect);
  const vdFrom = getVisualDirectionFrom();
  const vdTo = getVisualDirectionTo();
  if (!points?.length) {
    const fromPoints = fromD.getRelevantSidePoints(
      vdFrom,
      toD.center(),
      ARROW_WIDTH
    );
    const toPoints = toD.getRelevantSidePoints(
      vdTo,
      new Point(fromPoints.shiftedPoint),
      ARROW_WIDTH
    );
    return {
      start: getEdgeHandlerPoint(fromPoints.point, fromPoints.shiftedPoint),
      end: getEdgeHandlerPoint(toPoints.point, toPoints.shiftedPoint),
      points: [fromPoints.shiftedPoint, toPoints.shiftedPoint],
    };
  } else {
    const pathPoints = convertToAbsPoints(fromD, toD, points);
    const fromPoints = fromD.getRelevantSidePoints(
      vdFrom,
      new Point(pathPoints[0]),
      ARROW_WIDTH
    );
    const toPoints = toD.getRelevantSidePoints(
      vdTo,
      new Point(pathPoints[pathPoints.length - 1]),
      ARROW_WIDTH
    );
    pathPoints[0] = fromPoints.shiftedPoint;
    pathPoints[pathPoints.length - 1] = toPoints.shiftedPoint;

    return {
      start: getEdgeHandlerPoint(fromPoints.point, fromPoints.shiftedPoint),
      end: getEdgeHandlerPoint(toPoints.point, toPoints.shiftedPoint),
      points: pathPoints,
    };
  }
}

export function updatePath(
  fromRect: TRect,
  toRect: TRect,
  pathPoints: SVGPoint[]
) {
  const points = pathPoints.map((point) => new Point(point));
  const sourceDirection = getVisualDirectionFrom();
  const targetDirection = getVisualDirectionTo();
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
