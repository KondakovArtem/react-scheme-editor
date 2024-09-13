import { FC } from "react";
import { IDraggingEvent } from "../components/drag/Dragger";

export enum TangentDirections {
  AUTO = "auto",
  CLOSEST_POINT = "closest-point",
  DOWN = "down",
  LEFT = "left",
  OUTWARDS = "outwards",
  RIGHT = "right",
  UP = "up",
}

export const ARROW_WIDTH = 28;
export const ARROW_HEIGHT = 14;
export const ARROW_DEFAULT_LINE_COLOR = "var(--secondary-default)";
export const ARROW_DEFAULT_LINE_COLOR_HOVER = "var(--primary-lightest)";
export const ARROW_DEFAULT_LINE_COLOR_ACTIVE = "var(--primary-default)";
export const ZOOM_MIN_CONSTRAINTS: ValueConstraints = [0.05, 1];
export const ZOOM_MAX_CONSTRAINTS: ValueConstraints = [1, 10];
export const ZOOM_STEP_CONSTRAINTS: ValueConstraints = [0.01, 0.5];

export type TRecord<T = any> = Record<string, T>;

export type ValueConstraints = [number, number];

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type TRect = Position & Size;
export type SlotRect = Position &
  Size & {
    directions: TangentDirections[];
  };

export interface SchemaEditorConfig {
  canvasPosition?: Position;
  zoom?: number;
  selected?: SchemaEditorNode["id"][];
  showNavigator?: boolean;
}

export interface SchemaEditorProps {
  config?: SchemaEditorConfig;
  data?: SchemaEditorData;
  onChangeConfig?: (config: Partial<SchemaEditorConfig>) => void;
  onSelect?(ids: SchemaEditorNode["id"][]): void;
  onChangeData?(data: SchemaEditorData): void;
  children: FC<SchemaEditorNode>;
}

export interface SchemaEditorData<
  Data extends TRecord = TRecord,
  Type extends string = string,
  SlotData extends TRecord = TRecord,
  LinkData extends TRecord = TRecord
> {
  nodes?: SchemaEditorNode<Data, Type, SlotData>[];
  links?: SchemaEditorNodeLink<LinkData>[];
}

export type IAnchor = "start" | "middle" | "end";

export interface EntityAnchors {
  x: IAnchor;
  y: IAnchor;
}

export interface SchemaEditorNode<
  Data extends TRecord = TRecord,
  Type extends string = string,
  SlotData extends TRecord = TRecord
> extends SchemaEditorNodeSlot<Data> {
  id: string;
  position: Position;
  relativeEntityId?: string;
  relativeEntityAnchors?: EntityAnchors;
  anchors?: EntityAnchors;
  size?: Size;
  resizable?: boolean;
  data?: Data;
  type: Type;
  slots?: SchemaEditorNodeSlot<SlotData>[];
  hidden?: boolean;
}

export type SchemaEditorNodeSlotDirection = "in" | "out" | "all";

export type SchemaEditorNodeSlotVisualDirection = TangentDirections;

export interface SchemaEditorNodeSlot<Data extends TRecord = TRecord> {
  id: string;
  direction?: {
    [key in SchemaEditorNodeSlotDirection]?: SchemaEditorNodeSlotVisualDirection[];
  };

  data?: Data;
}

export type SchemaEditorNodeLinkLineType = "solid" | "dashed";

export type SchemaEditorLinkModel = {
  render(data: { from: SlotRect; to: SlotRect; points: Position[] }): {
    path: string;
    points: Position[];
  };
  onDrag(data: {
    from: SlotRect;
    to: SlotRect;
    event: IDraggingEvent;
    pointIndex: number;
    points: Position[];
    originPoint: Position;
  }): Position[];
};

export enum ESchemaEditorLinkModels {
  curve = "curve",
  orthogonal = "orthogonal",
}

export interface SchemaEditorNodeLink<LinkData extends TRecord = TRecord> {
  id: string;
  title?: string;
  points: Position[];
  model?: ESchemaEditorLinkModels;
  from: string;
  fromArrow?: SchemaEditorNodeLinkArrow;
  to: string;
  toArrow?: SchemaEditorNodeLinkArrow;
  lineType?: SchemaEditorNodeLinkLineType;
  lineColor?: string;
  lineColorActive?: string;
  data?: LinkData;
}

export enum SchemaEditorNodeLinkArrow {
  arrowNone = "arrowNone",
  arrowOne = "arrowOne",
  arrowMany = "arrowMany",
  arrowOneAndOnlyOne = "arrowOneAndOnlyOne",
  arrowZeroOrOne = "arrowZeroOrOne",
  arrowOneOrMany = "arrowOneOrMany",
  arrowZeroOrMany = "arrowZeroOrMany",
  arrowTerminate = "arrowTerminate",
  arrowInnerClass = "arrowInnerClass",
  arrowFoundMessage = "arrowFoundMessage",
  arrowDefault = "arrowDefault",
  arrowOutlinedTriangle = "arrowOutlinedTriangle",
  arrowTriangle = "arrowTriangle",
  arrowAggregation = "arrowAggregation",
  arrowComposition = "arrowComposition",
  arrowControlLifeline = "arrowControlLifeline",
  arrowEntityLifeline = "arrowEntityLifeline",
  arrowBoundaryLifeline = "arrowBoundaryLifeline",
}

export enum EDraggingMode {
  /** Dragging for main canvas */
  canvas = "canvas",
  /** Dragging for selection box */
  selection = "selection",
  /** Dragging for node item */
  item = "item",
  /** Dragging for map */
  navigator = "navigator",
  /** No Dragging */
  none = "none",
  /** Dragging for link point */
  point = "point",
}

export type MouseTouchEvent = (MouseEvent | TouchEvent) & {
  editorStopped?: boolean;
};

export enum EMouseButton {
  left = 0,
  middle = 1,
  right = 2,
}

export interface SchemaEditorNodeLinkDraft {
  from: {
    slotId: string;
    rect?: DOMRect;
  };
  to: {
    slotId?: string;
    rect?: DOMRect;
  };
}
