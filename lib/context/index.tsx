import { atom } from "jotai";
import { SchemaEditorConfig } from "../models";

export const configAtom = atom<SchemaEditorConfig | undefined>(undefined);

export const showNavigatorAtom = atom(
  (get) => get(configAtom)?.showNavigator,
  (get, set, showNavigator: boolean | undefined) =>
    set(configAtom, { ...get(configAtom), showNavigator })
);

