export type UnionToIntersection<T> = (
  T extends any ? (arg: T) => any : never
) extends (arg: infer I) => any
  ? I
  : never;
