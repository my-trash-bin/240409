import { useCallback } from "react";

import { useAsyncState } from "./useAsyncState";

export function useAsyncRerender() {
  const [count, setCount] = useAsyncState(0);
  return [
    useCallback(() => setCount((count) => (count + 1) % 42), []),
    count,
  ] as const;
}
