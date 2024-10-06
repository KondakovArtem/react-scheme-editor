import { Position, TangentDirections, TRect } from "../models";
import { Point } from "./point";

type RectSide = "left" | "right" | "top" | "bottom";

export class Rect implements TRect {
  public width!: number;
  public height!: number;
  public x!: number;
  public y!: number;

  public get left(): number {
    return this.x;
  }
  public get top(): number {
    return this.y;
  }
  public get bottom(): number {
    return this.y + this.height;
  }
  public get right(): number {
    return this.x + this.width;
  }

  public static from(data: TRect) {
    return new Rect(data);
  }

  public toJson(): TRect {
    const { x, y, width, height } = this;
    return { x, y, width, height };
  }

  constructor(
    x?: number | Rect | DOMRect | TRect,
    y?: number,
    w?: number,
    h?: number
  ) {
    if (!(this instanceof Rect)) {
      // eslint-disable-next-line no-constructor-return
      return new Rect(x, y, w, h);
    }

    if (Object(x) === x) {
      y = (x as Rect).y;
      w = (x as Rect).width;
      h = (x as Rect).height;
      x = (x as Rect).x;
    }

    this.x = x === undefined ? 0 : (x as number);
    this.y = y === undefined ? 0 : y;
    this.width = w === undefined ? 0 : w;
    this.height = h === undefined ? 0 : h;
  }

  public intersects(rect: Rect): boolean {
    const x1 = Math.max(rect.left, this.left);
    const y1 = Math.max(rect.top, this.top);
    const x2 = Math.min(rect.right, this.right);
    const y2 = Math.min(rect.bottom, this.bottom);

    return x1 < x2 && y1 < y2;
  }

  public includes(pos: Position): boolean {
    return (
      this.left < pos.x &&
      pos.x < this.right &&
      this.top < pos.y &&
      pos.y < this.bottom
    );
  }

  public sideNearestToPoint(point: Point): RectSide {
    point = new Point(point);
    const distToLeft = point.x - this.x;
    const distToRight = this.x + this.width - point.x;
    const distToTop = point.y - this.y;
    const distToBottom = this.y + this.height - point.y;
    let closest = distToLeft;
    let side: RectSide = "left";

    if (distToRight < closest) {
      closest = distToRight;
      side = "right";
    }
    if (distToTop < closest) {
      closest = distToTop;
      side = "top";
    }
    if (distToBottom < closest) {
      // closest = distToBottom;
      side = "bottom";
    }
    return side;
  }

  private getTangentDirectionBySide(side: RectSide): TangentDirections {
    switch (side) {
      case "top":
        return TangentDirections.UP;
      case "right":
        return TangentDirections.RIGHT;
      case "bottom":
        return TangentDirections.DOWN;
      case "left":
        return TangentDirections.LEFT;
      default:
        return TangentDirections.AUTO;
    }
  }

  public center(): Point {
    return new Point(this.x + this.width / 2, this.y + this.height / 2);
  }

  public getSideCenterTop(): Point {
    return new Point(this.x + this.width / 2, this.y);
  }

  public getSideCenterRight(): Point {
    return new Point(this.x + this.width, this.y + this.height / 2);
  }

  public getSideCenterBottom(): Point {
    return new Point(this.x + this.width / 2, this.y + this.height);
  }

  public getSideCenterLeft(): Point {
    return new Point(this.x, this.y + this.height / 2);
  }

  /** Метод определяет, какие точки находятся на заданном направлении от исходной точки и затем смещает одну
   *  из этих точек на указанное расстояние. Он возвращает обе точки: исходную точку и смещённую. */
  public getRelevantSidePoints(
    /**  Направление, в котором нужно найти точку (например, вверх, вправо, вниз, влево). */
    tangentDirection: TangentDirections[],
    /**  Исходная точка, от которой мы будем искать точку на заданном направлении */
    point: Point,
    /**  Расстояние, на которое нужно сместить найденную точку */
    shift: number
  ): {
    point: Point;
    shiftedPoint: Point;
  } {
    // получить точку в указанном направлении от исходной точки (point) и направление этого смещения (direction).
    const { point: sidePoint, direction } = this.getSidePoint(
      tangentDirection,
      point
    );
    const { x, y } = sidePoint;
    let shiftedPoint: Point = point;
    switch (direction) {
      case TangentDirections.UP:
        shiftedPoint = new Point(x, y - shift);
        break;
      case TangentDirections.RIGHT:
        shiftedPoint = new Point(x + shift, y);
        break;
      case TangentDirections.DOWN:
        shiftedPoint = new Point(x, y + shift);
        break;
      case TangentDirections.LEFT:
        shiftedPoint = new Point(x - shift, y);
        break;
      default:
        break;
    }
    return {
      point: sidePoint,
      shiftedPoint,
    };
  }

  private getSidePoint(
    tangentDirections: TangentDirections[],
    point: Point
  ): {
    point: Point;
    direction: TangentDirections;
  } {
    const tangentDirection = tangentDirections[0];

    switch (tangentDirection) {
      case TangentDirections.UP:
        return {
          point: this.getSideCenterTop(),
          direction: tangentDirection,
        };
      case TangentDirections.RIGHT:
        return {
          point: this.getSideCenterRight(),
          direction: tangentDirection,
        };
      case TangentDirections.DOWN:
        return {
          point: this.getSideCenterBottom(),
          direction: tangentDirection,
        };
      case TangentDirections.LEFT:
        return {
          point: this.getSideCenterLeft(),
          direction: tangentDirection,
        };
      default:
        break;
    }

    const pointOnRect = this.getClosestPointOnRect(point);
    const side = this.sideNearestToPoint(pointOnRect);
    const direction = this.getTangentDirectionBySide(side);
    return {
      point: pointOnRect,
      direction,
    };
  }

  public getSideCenters(): Point[] {
    return [
      this.getSideCenterTop(),
      this.getSideCenterRight(),
      this.getSideCenterBottom(),
      this.getSideCenterLeft(),
    ];
  }

  public sideCenterNearestToPoint(point: Point): Point {
    point = new Point(point);
    const sidePoints = this.getSideCenters()
      .map((sidePoint) => ({
        point: sidePoint,
        d: sidePoint.distance(point),
      }))
      .sort((a, b) => (a.d < b.d ? -1 : 1));
    return sidePoints[0].point;
  }

  public getSideLineTop(): [Point, Point] {
    return [new Point(this.left, this.top), new Point(this.right, this.top)];
  }

  public getSideLineRight(): [Point, Point] {
    return [
      new Point(this.right, this.top),
      new Point(this.right, this.bottom),
    ];
  }

  public getSideLineBottom(): [Point, Point] {
    return [
      new Point(this.right, this.bottom),
      new Point(this.left, this.bottom),
    ];
  }

  public getSideLineLeft(): [Point, Point] {
    return [new Point(this.left, this.bottom), new Point(this.left, this.top)];
  }

  public getRelevantSideLines(
    tangentDirection?: TangentDirections
  ): [Point, Point][] {
    switch (tangentDirection) {
      case TangentDirections.UP:
        return [this.getSideLineTop()];
      case TangentDirections.RIGHT:
        return [this.getSideLineRight()];
      case TangentDirections.DOWN:
        return [this.getSideLineBottom()];
      case TangentDirections.LEFT:
        return [this.getSideLineLeft()];
      default:
        return [
          this.getSideLineTop(),
          this.getSideLineRight(),
          this.getSideLineBottom(),
          this.getSideLineLeft(),
        ];
    }
  }

  public getClosestPointOnRect(
    point: Point,
    tangentDirection?: TangentDirections
  ): Point {
    const lines: [Point, Point][] = this.getRelevantSideLines(tangentDirection);

    const dist = lines.reduce((pre, line) => {
      const distance = point.distanceToLine(...line);
      // const d = pDistance(point.x, point.y, ...line);
      if (!pre || distance.d < pre.d) {
        return distance;
      }
      return pre;
    }, null as unknown as ReturnType<typeof point.distanceToLine>);

    return dist.p;
  }
}
