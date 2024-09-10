import { Position } from "../models";


function squaredLength(start: Point, end: Point): number {
  let x0 = start.x;
  let y0 = start.y;
  const x1 = end.x;
  const y1 = end.y;
  const res = (x0 -= x1) * x0 + (y0 -= y1) * y0;
  return res;
}

export function length(start: Point, end: Point): number {
  return Math.sqrt(squaredLength(start, end));
}

export class Point implements Position {
  public x: number;
  public y: number;

  constructor(x?: number | string | Position, y?: number | string | Position) {
    // if (!(this instanceof Point)) {
    //     return new Point(x, y);
    // }

    if (typeof x === "string") {
      const xy = x.split(x.indexOf("@") === -1 ? " " : "@");
      x = parseFloat(xy[0]);
      y = parseFloat(xy[1]);
    } else if (Object(x) === x) {
      y = (x as Position).y;
      x = (x as Position).x;
    }

    this.x = x === undefined ? 0 : (x as number);
    this.y = y === undefined ? 0 : (y as number);
  }

  public inRect(rect: DOMRect): boolean {
    return (
      this.x >= rect.left &&
      this.x <= rect.right &&
      this.y >= rect.top &&
      this.y <= rect.bottom
    );
  }

  public magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y) || 0.01;
  }

  private toRad(deg: number, over360?: boolean): number {
    over360 = over360 || false;
    deg = over360 ? deg : deg % 360;
    return (deg * Math.PI) / 180;
  }

  private normalizeAngle(angle: number): number {
    return (angle % 360) + (angle < 0 ? 360 : 0);
  }

  public dot(p: Point): number {
    return p ? this.x * p.x + this.y * p.y : NaN;
  }

  public clone(): Point {
    return new Point(this);
  }

  public toJson(): Position {
    const { x, y } = this;
    return { x, y };
  }

  public rotate(origin: Point | null, angle: number): Point {
    if (angle === 0) {
      return this;
    }

    origin = origin || new Point(0, 0);

    angle = this.toRad(this.normalizeAngle(-angle));
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    const x =
      cosAngle * (this.x - origin.x) -
      sinAngle * (this.y - origin.y) +
      origin.x;
    const y =
      sinAngle * (this.x - origin.x) +
      cosAngle * (this.y - origin.y) +
      origin.y;

    this.x = x;
    this.y = y;
    return this;
  }

  public offset(dx: number | Point, dy?: number): Point {
    if (Object(dx) === dx) {
      dy = (dx as Point).y;
      dx = (dx as Point).x;
    }

    this.x += (dx as number) || 0;
    this.y += (dy as number) || 0;
    return this;
  }

  public distance(p: Point): number {
    return length(this, p);
  }

  public distanceToLine(start: Point, end: Point): { d: number; p: Point } {
    const { x, y } = this;
    const { x: x1, y: y1 } = start;
    const { x: x2, y: y2 } = end;
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0)
      // in case of 0 length line
      param = dot / lenSq;

    let xx;
    let yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    return {
      d: Math.sqrt((x - xx) ** 2 + (y - yy) ** 2),
      p: new Point(xx, yy),
    };
  }

  public scale(sx: number, sy: number, origin?: Point): Point {
    origin = (origin && new Point(origin)) || new Point(0, 0);
    this.x = origin.x + sx * (this.x - origin.x);
    this.y = origin.y + sy * (this.y - origin.y);
    return this;
  }

  public normalize(len?: number): Point {
    const scale = (len || 1) / this.magnitude();
    return this.scale(scale, scale);
  }

  public difference(dx: number | Point, dy?: number): Point {
    if (Object(dx) === dx) {
      dy = (dx as Point).y;
      dx = (dx as Point).x;
    }

    return new Point(this.x - ((dx as number) || 0), this.y - (dy || 0));
  }
}
