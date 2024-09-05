import { Rect, TRecord } from "../models";
import { createStateContextFactory } from "./context.factory";

export type NodeRects = TRecord<Rect | undefined>;

export const {
  Provider: NodeRectsProvider,
  useStateContext: useNodeRectsState,
  useDispatchContext: useNodeRectsDispatch,
} = createStateContextFactory<NodeRects>("NodeRects", (pre, cur) => ({
  ...pre,
  ...cur,
}));
