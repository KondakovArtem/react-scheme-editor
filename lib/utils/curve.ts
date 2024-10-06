import { Point as SVGPoint } from "svg-points";
import { Point } from "./point";

export class Curve {
  public start!: Point;
  public controlPoint1!: Point;
  public controlPoint2!: Point;
  public end!: Point;

  constructor(p1: Point | Curve, p2: Point, p3: Point, p4: Point) {
    // if (!(this instanceof Curve)) {
    //     return new Curve(p1, p2, p3, p4);
    // }

    if (p1 instanceof Curve) {
      // eslint-disable-next-line no-constructor-return
      return new Curve(p1.start, p1.controlPoint1, p1.controlPoint2, p1.end);
    }

    this.start = new Point(p1);
    this.controlPoint1 = new Point(p2);
    this.controlPoint2 = new Point(p3);
    this.end = new Point(p4);
  }

  public toSvgPoints(start?: boolean): SVGPoint[] {
    const res: SVGPoint[] = [];
    if (start) res.push(this.start.toJson());
    res.push({
      ...this.end.toJson(),
      curve: {
        type: "cubic",
        x1: this.controlPoint1.x,
        y1: this.controlPoint1.y,
        x2: this.controlPoint2.x,
        y2: this.controlPoint2.y,
      },
    });
    return res;
  }
}
