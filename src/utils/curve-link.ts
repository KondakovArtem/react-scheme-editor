import { TangentDirections } from "../models";
import { Curve } from "./curve";

import { Point } from "./point";
import { Rect } from "./rect";

interface ILinkView {
  sourceBBox: Rect;
  targetBBox: Rect;
}

enum Directions {
  AUTO = "auto",
  CLOSEST_POINT = "closest-point",
  HORIZONTAL = "horizontal",
  OUTWARDS = "outwards",
  VERTICAL = "vertical",
}

function angleBetweenVectors(v1: Point, v2: Point): number {
  let cos = v1.dot(v2) / (v1.magnitude() * v2.magnitude());
  if (cos < -1) {
    cos = -1;
  }
  if (cos > 1) {
    cos = 1;
  }
  return Math.acos(cos);
}

function getAutoSourceDirection(linkView: ILinkView, route: Point[]): Point {
  const { sourceBBox } = linkView;
  let sourceSide;
  if (!sourceBBox.width || !sourceBBox.height) {
    sourceSide = sourceBBox.sideNearestToPoint(route[1]);
  } else {
    sourceSide = sourceBBox.sideNearestToPoint(route[0]);
  }

  switch (sourceSide) {
    case "top":
      return new Point(0, -1);
    case "bottom":
      return new Point(0, 1);
    case "right":
      return new Point(1, 0);
    case "left":
      return new Point(-1, 0);
    default:
      return new Point(0, -1);
  }
}

function getAutoTargetDirection(linkView: ILinkView, route: Point[]): Point {
  const { targetBBox } = linkView;
  let targetSide;
  if (!targetBBox.width || !targetBBox.height) {
    targetSide = targetBBox.sideNearestToPoint(route[route.length - 2]);
  } else {
    targetSide = targetBBox.sideNearestToPoint(route[route.length - 1]);
  }

  switch (targetSide) {
    case "top":
      return new Point(0, -1);
    case "bottom":
      return new Point(0, 1);
    case "right":
      return new Point(1, 0);
    case "left":
      return new Point(-1, 0);
    default:
      return new Point(0, -1);
  }
}

function getTargetTangentDirection(
  linkView: ILinkView,
  route: Point[],
  direction: Directions,
  options: InnerOptions
): Point {
  if (options.targetDirection) {
    switch (options.targetDirection) {
      case TangentDirections.UP:
        return new Point(0, -1);
      case TangentDirections.DOWN:
        return new Point(0, 1);
      case TangentDirections.LEFT:
        return new Point(-1, 0);
      case TangentDirections.RIGHT:
        return new Point(1, 0);
      case TangentDirections.AUTO:
        return getAutoTargetDirection(linkView, route);
      // case TangentDirections.CLOSEST_POINT:
      //     return getClosestPointTargetDirection(linkView, route, options);
      // case TangentDirections.OUTWARDS:
      //     return getOutwardsTargetDirection(linkView, route, options);
      default:
        return options.targetDirection as Point;
    }
  }
  return new Point(0, -1);
  // switch (direction) {
  //     case Directions.HORIZONTAL:
  //         return getHorizontalTargetDirection(linkView, route, options);
  //     case Directions.VERTICAL:
  //         return getVerticalTargetDirection(linkView, route, options);
  //     case Directions.CLOSEST_POINT:
  //         return getClosestPointTargetDirection(linkView, route, options);
  //     case Directions.OUTWARDS:
  //         return getOutwardsTargetDirection(linkView, route, options);
  //     case Directions.AUTO:
  //     default:
  //         return getAutoTargetDirection(linkView, route, options);
  // }
}

function getSourceTangentDirection(
  linkView: ILinkView,
  route: Point[],
  direction: Directions,
  options: InnerOptions
): Point {
  if (options.sourceDirection) {
    switch (options.sourceDirection) {
      case TangentDirections.UP:
        return new Point(0, -1);
      case TangentDirections.DOWN:
        return new Point(0, 1);
      case TangentDirections.LEFT:
        return new Point(-1, 0);
      case TangentDirections.RIGHT:
        return new Point(1, 0);
      case TangentDirections.AUTO:
        return getAutoSourceDirection(linkView, route);
      // case TangentDirections.CLOSEST_POINT:
      //     return getClosestPointSourceDirection(linkView, route, options);
      // case TangentDirections.OUTWARDS:
      //     return getOutwardsSourceDirection(linkView, route, options);
      default:
        return options.sourceDirection as Point;
    }
  }
  return new Point(0, -1);
  // switch (direction) {
  //     case Directions.HORIZONTAL:
  //         return getHorizontalSourceDirection(linkView, route, options);
  //     case Directions.VERTICAL:
  //         return getVerticalSourceDirection(linkView, route, options);
  //     case Directions.CLOSEST_POINT:
  //         return getClosestPointSourceDirection(linkView, route, options);
  //     case Directions.OUTWARDS:
  //         return getOutwardsSourceDirection(linkView, route, options);
  //     case Directions.AUTO:
  //     default:
  //         return getAutoSourceDirection(linkView, route, options);
  // }
}

interface ICurveLinkOptions {
  direction?: Directions;
  precision?: number;
  raw?: boolean;
  distanceCoefficient?: number;
  angleTangentCoefficient?: number;
  tension?: number;
  sourceTangent?: Point;
  targetTangent?: Point;
  sourceDirection?: string;
  targetDirection?: string;
}

interface InnerOptions {
  coeff: number;
  angleTangentCoefficient: number;
  tau: number;
  sourceTangent: Point | null;
  targetTangent: Point | null;
  sourceDirection?: Point | string | null;
  targetDirection?: Point | string | null;
}

export function curveLink(
  completeRoute: Point[],
  opt: ICurveLinkOptions | undefined,
  linkView: ILinkView
): Curve[] {
  if (!completeRoute) completeRoute = [];
  if (!opt) opt = {};

  // const raw = Boolean(opt.raw);
  // distanceCoefficient - a coefficient of the tangent vector length relative to the distance between points.
  // angleTangentCoefficient - a coefficient of the end tangents length in the case of angles larger than 45 degrees.
  // tension - a Catmull-Rom curve tension parameter.
  // sourceTangent - a tangent vector along the curve at the sourcePoint.
  // sourceDirection - a unit direction vector along the curve at the sourcePoint.
  // targetTangent - a tangent vector along the curve at the targetPoint.
  // targetDirection - a unit direction vector along the curve at the targetPoint.
  // precision - a rounding precision for path values.
  const { direction = Directions.AUTO } = opt;

  const options: InnerOptions = {
    coeff: opt.distanceCoefficient || 0.6,
    angleTangentCoefficient: opt.angleTangentCoefficient || 80,
    tau: opt.tension || 0.5,
    sourceTangent: opt.sourceTangent ? new Point(opt.sourceTangent) : null,
    targetTangent: opt.targetTangent ? new Point(opt.targetTangent) : null,
    sourceDirection: opt.sourceDirection,
    targetDirection: opt.targetDirection,
  };

  // The calculation of a sourceTangent
  let sourceTangent;
  if (options.sourceTangent) {
    sourceTangent = options.sourceTangent;
  } else {
    const sourceDirection = getSourceTangentDirection(
      linkView,
      completeRoute,
      direction,
      options
    );
    const tangentLength =
      completeRoute[0].distance(completeRoute[1]) * options.coeff;
    const pointsVector = completeRoute[1]
      .difference(completeRoute[0])
      .normalize();
    const angle = angleBetweenVectors(sourceDirection, pointsVector);
    if (angle > Math.PI / 4) {
      const updatedLength =
        tangentLength + (angle - Math.PI / 4) * options.angleTangentCoefficient;
      sourceTangent = sourceDirection
        .clone()
        .scale(updatedLength, updatedLength);
    } else {
      sourceTangent = sourceDirection
        .clone()
        .scale(tangentLength, tangentLength);
    }
  }

  // The calculation of a targetTangent
  let targetTangent;
  if (options.targetTangent) {
    targetTangent = options.targetTangent;
  } else {
    const targetDirection = getTargetTangentDirection(
      linkView,
      completeRoute,
      direction,
      options
    );
    const last = completeRoute.length - 1;
    const tangentLength$1 =
      completeRoute[last - 1].distance(completeRoute[last]) * options.coeff;
    const pointsVector$1 = completeRoute[last - 1]
      .difference(completeRoute[last])
      .normalize();
    const angle$1 = angleBetweenVectors(targetDirection, pointsVector$1);
    if (angle$1 > Math.PI / 4) {
      const updatedLength$1 =
        tangentLength$1 +
        (angle$1 - Math.PI / 4) * options.angleTangentCoefficient;
      targetTangent = targetDirection
        .clone()
        .scale(updatedLength$1, updatedLength$1);
    } else {
      targetTangent = targetDirection
        .clone()
        .scale(tangentLength$1, tangentLength$1);
    }
  }

  const catmullRomCurves = createCatmullRomCurves(
    completeRoute,
    sourceTangent,
    targetTangent,
    options
  );
  return catmullRomCurves.map((crv) => catmullRomToBezier(crv, options));
  // const path = new Path(bezierCurves).round(precision);
  // return raw ? path : path.serialize();
}

function determinant(v1: Point, v2: Point): number {
  return v1.x * v2.y - v1.y * v2.x;
}

// The function to convert Catmull-Rom curve to Bezier curve using the tension (tau)
function catmullRomToBezier(points: Point[], options: InnerOptions): Curve {
  const { tau } = options;

  const bcp1 = new Point();
  bcp1.x = points[1].x + (points[2].x - points[0].x) / (6 * tau);
  bcp1.y = points[1].y + (points[2].y - points[0].y) / (6 * tau);

  const bcp2 = new Point();
  bcp2.x = points[2].x + (points[3].x - points[1].x) / (6 * tau);
  bcp2.y = points[2].y + (points[3].y - points[1].y) / (6 * tau);
  return new Curve(points[1], bcp1, bcp2, points[2]);
}

function rotateVector(vector: Point, angle: number): void {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x = cos * vector.x - sin * vector.y;
  const y = sin * vector.x + cos * vector.y;
  vector.x = x;
  vector.y = y;
}

function createCatmullRomCurves(
  points: Point[],
  sourceTangent: Point,
  targetTangent: Point,
  options: InnerOptions
): Point[][] {
  const { tau } = options;
  const { coeff } = options;
  const distances: number[] = [];
  const tangents: (Point | Point[])[] = [];
  const catmullRomCurves = [];
  const n = points.length - 1;

  for (let i = 0; i < n; i++) {
    distances[i] = points[i].distance(points[i + 1]);
  }

  tangents[0] = sourceTangent;
  tangents[n] = targetTangent;

  // The calculation of tangents of vertices
  for (let i$1 = 1; i$1 < n; i$1++) {
    let tpPrev;
    let tpNext;
    if (i$1 === 1) {
      tpPrev = points[i$1 - 1]
        .clone()
        .offset((tangents[i$1 - 1] as Point).x, (tangents[i$1 - 1] as Point).y);
    } else {
      tpPrev = points[i$1 - 1].clone();
    }
    if (i$1 === n - 1) {
      tpNext = points[i$1 + 1]
        .clone()
        .offset((tangents[i$1 + 1] as Point).x, (tangents[i$1 + 1] as Point).y);
    } else {
      tpNext = points[i$1 + 1].clone();
    }
    const v1 = tpPrev.difference(points[i$1]).normalize();
    const v2 = tpNext.difference(points[i$1]).normalize();
    const vAngle = angleBetweenVectors(v1, v2);

    let rot = (Math.PI - vAngle) / 2;
    const vectorDeterminant = determinant(v1, v2);
    const pointsDeterminant = determinant(
      points[i$1].difference(points[i$1 + 1]),
      points[i$1].difference(points[i$1 - 1])
    );
    if (vectorDeterminant < 0) {
      rot = -rot;
    }
    if (
      vAngle < Math.PI / 2 &&
      ((rot < 0 && pointsDeterminant < 0) || (rot > 0 && pointsDeterminant > 0))
    ) {
      rot -= Math.PI;
    }
    const t = v2.clone();
    rotateVector(t, rot);

    const t1 = t.clone();
    const t2 = t.clone();
    const scaleFactor1 = distances[i$1 - 1] * coeff;
    const scaleFactor2 = distances[i$1] * coeff;
    t1.scale(scaleFactor1, scaleFactor1);
    t2.scale(scaleFactor2, scaleFactor2);

    tangents[i$1] = [t1, t2];
  }

  // The building of a Catmull-Rom curve based of tangents of points
  for (let i$2 = 0; i$2 < n; i$2++) {
    let p0;
    let p3;
    if (i$2 === 0) {
      p0 = points[i$2 + 1].difference(
        (tangents[i$2] as Point).x / tau,
        (tangents[i$2] as Point).y / tau
      );
    } else {
      p0 = points[i$2 + 1].difference(
        (tangents[i$2] as Point[])[1].x / tau,
        (tangents[i$2] as Point[])[1].y / tau
      );
    }
    if (i$2 === n - 1) {
      p3 = points[i$2]
        .clone()
        .offset(
          (tangents[i$2 + 1] as Point).x / tau,
          (tangents[i$2 + 1] as Point).y / tau
        );
    } else {
      p3 = points[i$2].difference(
        (tangents[i$2 + 1] as Point[])[0].x / tau,
        (tangents[i$2 + 1] as Point[])[0].y / tau
      );
    }

    catmullRomCurves[i$2] = [p0, points[i$2], points[i$2 + 1], p3];
  }
  return catmullRomCurves;
}
