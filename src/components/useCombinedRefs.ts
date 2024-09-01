import { MutableRefObject } from "react";

export function useCombinedRefs<T extends HTMLElement>(
  ...refs: (MutableRefObject<T | null> | ((node: T | null) => void))[]
) {
  return (node: T) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    });
  };
}
