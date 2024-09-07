import { atom, WritableAtom, useAtomValue } from "jotai";
import { useMemo } from "react";

export function useSelectAtomValue<T, G extends unknown[], V, R>(
  rootAtom: WritableAtom<T, G, V>,
  callback: (data: T) => R,
  args: any[]
) {
  return useAtomValue(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useMemo(() => atom((get) => callback(get(rootAtom))), args)
  );
}

// () => atom((get) => get(selectedNodeAtom)?.includes(id) ?? false)
