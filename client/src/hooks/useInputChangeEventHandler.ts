import { ChangeEvent, useCallback } from "react";

export function useInputChangeEventHandler(setValue: (value: string) => void) {
  return useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    [setValue]
  );
}
