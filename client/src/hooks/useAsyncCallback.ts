import { DependencyList, useCallback, useRef } from "react";

import { Awaitable } from "../util/Awaitable";
import { useAsyncRerender } from "./useAsyncRerender";

export function useAsyncCallback(
  callback: () => Awaitable<void>,
  deps: DependencyList
): [callback: () => void, running: boolean] {
  const runningRef = useRef(false);
  const [rerender] = useAsyncRerender();
  const resultCallback = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    (async () => {
      try {
        callback();
      } finally {
        runningRef.current = false;
        rerender();
      }
    })();
  }, [callback, ...deps]);
  return [resultCallback, runningRef.current];
}
