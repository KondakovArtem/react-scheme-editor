import { atom } from "jotai";
import { configAtom } from ".";

export const zoomAtom = atom(
  (get) => get(configAtom)?.zoom ?? 1,
  (get, set, zoom: number) => set(configAtom, { ...get(configAtom), zoom })
);
