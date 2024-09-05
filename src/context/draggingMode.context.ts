import { EDraggingMode } from "../models";
import { createStateContextFactory } from "./context.factory";

export const {
  Provider: DraggingModeProvider,
  useDispatchContext: useDraggingModeDispatch,
  useStateContext: useDraggingModeState,
} = createStateContextFactory<EDraggingMode>("DraggingMode");
