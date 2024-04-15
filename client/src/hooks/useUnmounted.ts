import { MutableRefObject, useEffect, useRef } from "react";

export function useUnmounted(): MutableRefObject<boolean> {
  const result = useRef(false);
  useEffect(() => {
    result.current = false;
    return () => {
      result.current = true;
    };
  }, [result]);
  return result;
}
