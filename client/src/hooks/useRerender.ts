import { useCallback, useState } from "react";

export function useRerender() {
  const [count, setCount] = useState(0);
  return [
    useCallback(() => setCount((count) => (count + 1) % 42), []),
    count,
  ] as const;
}
