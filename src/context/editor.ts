import { createContext, FC, MouseEvent } from "react";
import type {
  EDraggingMode,
  Position,
  SchemaEditorNode,
  SchemeEditorConfig,
  Size,
} from "../models";

export interface ISchemeEditorContext {
  draggingMode?: EDraggingMode;
  setDraggingMode: (v?: EDraggingMode) => void;
  config?: SchemeEditorConfig;
  setConfig?: (c: Partial<SchemeEditorConfig>) => void;
  onSelect?: (data: { event: MouseEvent; id?: SchemaEditorNode["id"] }) => void;
  setZoom?: (data: { zoom: number; canvasPosition: Position }) => void;
  onDragStart?: (event: MouseEvent) => void;
  onDragMove?: (event: MouseEvent) => void;
  onDragEnd?: (data: { event: MouseEvent; position: Position }) => void;
  dragCanvasClasses?: string[];
  NodeTemplate?: FC<{ data: SchemaEditorNode }>;
  selectionStartPos?: Position;
  selectionRect?: Position & Size;
}

export const SchemeEditorContext = createContext<
  ISchemeEditorContext | undefined
>(undefined);
