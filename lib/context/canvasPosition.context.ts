import { atom } from "jotai";
import type { Position } from "../models";
import { configAtom } from ".";

const DEF_POSITION = { x: 0, y: 0 };
export const canvasPositionAtom = atom(
  (get) => get(configAtom)?.canvasPosition ?? DEF_POSITION,
  (get, set, canvasPosition: Position | undefined) => {
    set(configAtom, { ...get(configAtom), canvasPosition });
  }
);
