import { atom } from "jotai";
import type { Size } from "../models";

const DEF_CANVAS_SIZE = { width: 0, height: 0 };
export const canvasSizeAtom = atom(
  DEF_CANVAS_SIZE,
  (get, set, s: Partial<Size>) => {
    set(canvasSizeAtom, s);
  }
);
