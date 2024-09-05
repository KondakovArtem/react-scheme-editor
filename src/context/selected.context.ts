import type { MouseEvent } from "react";
import { SchemaEditorNode } from "../models";
import { createStateContextFactory } from "./context.factory";

export type SelectNodeDispatcher = (data: {
  e: MouseEvent;
  ids: SchemaEditorNode["id"][];
}) => void;

export const {
  Provider: SelectedNodeProvider,
  useStateContext: useSelectedNodeState,
  useDispatchContext: useSelectedNodeDispatch,
  useGetStateRef: useGetSelectedRef,
} = createStateContextFactory<SchemaEditorNode["id"][], SelectNodeDispatcher>(
  "SelectedNode"
);
