import { createStateContextFactory } from "./context.factory";

export const {
  Provider: ZoomProvider,
  useStateContext: useZoomState,
  useDispatchContext: useZoomDispatch,
} = createStateContextFactory<number>("Zoom");
