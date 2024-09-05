import type { Size } from "../models";
import { createStateContextFactory } from "./context.factory";

export const {
  Provider: CanvasSizeProvider,
  useDispatchContext: useCanvasSizeDispatch,
  useStateContext: useCanvasSizeState,
} = createStateContextFactory<Size>("CanvasSize");
