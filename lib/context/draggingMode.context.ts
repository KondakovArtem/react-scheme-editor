import { atom } from 'jotai';

import { EDraggingMode } from '../models';

export const dragginModeAtom = atom(EDraggingMode.none);

// export const dragginModeAtom = atom(
//   (get) => get(mode),
//   (get, set, val: EDraggingMode) => set(mode, val)
// );

dragginModeAtom.debugLabel = 'dragginModeAtom';
