import { default as API_DEFINITION } from "@this-project/api";
import { ParamsFromPath } from "@this-project/util/ParamsFromPath";
import { UnionToIntersection } from "@this-project/util/UnionToIntersection";

import { XHR, XHRMethod } from "./util/XHR";

type API_MAP = UnionToIntersection<
  API_DEFINITION extends infer I
    ? I extends {
        method: infer IMethod extends XHRMethod;
        path: infer IPath extends string;
      }
      ? { [K in `${IMethod}:${IPath}`]: I }
      : never
    : never
>;

export function API<T extends keyof API_MAP>(
  ...[methodAndPath, params, payload]: "request" extends keyof API_MAP[T]
    ? [
        methodAndPath: T,
        params: ParamsFromPath<API_MAP[T]["path"]>,
        payload: API_MAP[T]["request"]
      ]
    : ParamsFromPath<API_MAP[T]["path"]> extends undefined
    ? [methodAndPath: T]
    : [methodAndPath: T, params: ParamsFromPath<API_MAP[T]["path"]>]
): [UnionToIntersection<T>] extends [never]
  ? "Error: specify one method/path."
  : Promise<API_MAP[T]["response"]> {
  const firstColonIndex = methodAndPath.indexOf(":");
  const method = methodAndPath.slice(0, firstColonIndex) as XHRMethod;
  const path = methodAndPath.slice(firstColonIndex + 1);

  return XHR<
    "request" extends keyof API_MAP[T] ? API_MAP[T]["request"] : undefined,
    Promise<API_MAP[T]["response"]>
  >(
    method,
    path.replace(/:(.*?)(\/|$)/g, (_, a, b) => `${params?.[a]}${b}`),
    payload as any
  ) as any;
}
