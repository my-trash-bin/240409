import { default as API_DEFINITION } from "@this-project/api";
import { ParamsFromPath } from "@this-project/util/ParamsFromPath";

import { XHR } from "../util/XHR";

export function API<T extends API_DEFINITION>(
  ...[method, path, params, payload]: "request" extends keyof T
    ? [
        method: T["method"],
        path: T["path"],
        params: ParamsFromPath<T["path"]>,
        payload: T["request"]
      ]
    : [method: T["method"], path: T["path"], params: ParamsFromPath<T["path"]>]
): Promise<T["response"]> {
  return XHR<
    "request" extends keyof T ? T["request"] : undefined,
    T["response"]
  >(
    method,
    path.replace(/:.*?\//, (a) => `${params?.[a]}/`),
    payload as "request" extends keyof T ? T["request"] : undefined
  );
}
