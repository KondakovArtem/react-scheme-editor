import { MouseEvent } from "react";
import type { Position, SchemaEditorConfig, SchemaEditorData } from "../models";
import { atom } from "jotai";

export interface ISchemaEditorMethodsContext {
  onChangeConfig?(data: Partial<SchemaEditorConfig>): void;
  onDragStart?(event: MouseEvent): void;
  onDragMove?(event: MouseEvent): void;
  onDragEnd?(data: { event: MouseEvent; position: Position }): void;
  onSelect?(ids: string[]): void;
  onChangeData?(data: SchemaEditorData): void;
}

// export const SchemaEditorMethodsContext = createContext<
//   ISchemaEditorMethodsContext | undefined
// >(undefined);

export const methodsAtom = atom<ISchemaEditorMethodsContext | undefined>();
