import { useCallback, useEffect } from "react";

export const useEffectDebounce = (
  callback: any,
  delay: number,
  dependencies: any[]
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cb = useCallback(callback, dependencies);

  useEffect(() => {
    const handler = setTimeout(cb, delay);

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};
