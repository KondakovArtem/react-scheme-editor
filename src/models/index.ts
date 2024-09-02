import React, { FC } from "react";

export enum TangentDirections {
  AUTO = "auto",
  CLOSEST_POINT = "closest-point",
  DOWN = "down",
  LEFT = "left",
  OUTWARDS = "outwards",
  RIGHT = "right",
  UP = "up",
}

type TRecord = Record<string, any>;

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface SchemeEditorConfig {
  canvasPosition?: Position;
  zoom?: number;
  selected?: SchemaEditorNode["id"][];
}

export interface SchemeEditorProps {
  config?: SchemeEditorConfig;
  data?: SchemaEditorData;
  changeConfig?: (config: Partial<SchemeEditorConfig>) => void;
  children: FC<{ data: SchemaEditorNode }>;
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
> {
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
  direction: SchemaEditorNodeSlotDirection;
  visualDirection?: SchemaEditorNodeSlotVisualDirection;
  data?: Data;
}

export type SchemaEditorNodeLinkLineType = "solid" | "dashed";

export interface SchemaEditorNodeLink<LinkData extends TRecord = TRecord> {
  id: string;
  title?: string;
  points: Position[];
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
  canvas = 1,
  selection = 2,
  item = 3,
}
