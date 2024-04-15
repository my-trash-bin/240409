import { default as API_DEFINITION } from "@this-project/api";
import { ParamsFromPath } from "@this-project/util/ParamsFromPath";
import { UnionToIntersection } from "@this-project/util/UnionToIntersection";

import { XHR, XHRMethod } from "./util/XHR";

export function API<
  TMethod extends XHRMethod,
  TPath extends Extract<API_DEFINITION, { method: TMethod }>["path"]
>(
  ...[method, path, params, payload]: "request" extends keyof Extract<
    API_DEFINITION,
    { method: TMethod; path: TPath }
  >
    ? [
        method: Extract<
          API_DEFINITION,
          { method: TMethod; path: TPath }
        >["method"],
        path: Extract<API_DEFINITION, { method: TMethod; path: TPath }>["path"],
        params: ParamsFromPath<
          Extract<API_DEFINITION, { method: TMethod; path: TPath }>["path"]
        >,
        payload: Extract<
          API_DEFINITION,
          { method: TMethod; path: TPath }
        >["request"]
      ]
    : ParamsFromPath<
        Extract<API_DEFINITION, { method: TMethod; path: TPath }>["path"]
      > extends undefined
    ? [
        method: Extract<
          API_DEFINITION,
          { method: TMethod; path: TPath }
        >["method"],
        path: Extract<API_DEFINITION, { method: TMethod; path: TPath }>["path"]
      ]
    : [
        method: Extract<
          API_DEFINITION,
          { method: TMethod; path: TPath }
        >["method"],
        path: Extract<API_DEFINITION, { method: TMethod; path: TPath }>["path"],
        params: ParamsFromPath<
          Extract<API_DEFINITION, { method: TMethod; path: TPath }>["path"]
        >
      ]
): [UnionToIntersection<TMethod>] extends [never]
  ? "Error: specify one method."
  : [UnionToIntersection<TPath>] extends [never]
  ? "Error: specify one path."
  : Promise<
      Extract<API_DEFINITION, { method: TMethod; path: TPath }>["response"]
    > {
  return XHR<
    "request" extends keyof Extract<
      API_DEFINITION,
      { method: TMethod; path: TPath }
    >
      ? Extract<API_DEFINITION, { method: TMethod; path: TPath }>["request"]
      : undefined,
    Extract<API_DEFINITION, { method: TMethod; path: TPath }>["response"]
  >(
    method,
    path.replace(/:.*?\//, (a) => `${params?.[a]}/`),
    payload as any
  ) as any;
}
