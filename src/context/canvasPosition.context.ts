import type { Position } from "../models";
import { createStateContextFactory } from "./context.factory";

export const {
  Provider: CanvasPositionProvider,
  useDispatchContext: useCanvasPositionDispatch,
  useStateContext: useCanvasPositionState,
} = createStateContextFactory<Position>("CanvasPosition");
