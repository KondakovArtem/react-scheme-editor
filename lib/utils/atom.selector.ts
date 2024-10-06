import { atom, WritableAtom, useAtomValue, Getter } from "jotai";
import { useMemo } from "react";

export function useSelectAtomValue<T, G extends unknown[], V, R>(
  rootAtom: WritableAtom<T, G, V>,
  callback: (data: T, get: Getter) => R,
  args: any[]
) {
  return useAtomValue(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useMemo(() => atom((get) => callback(get(rootAtom), get)), args)
  );
}

// () => atom((get) => get(selectedNodeAtom)?.includes(id) ?? false)
