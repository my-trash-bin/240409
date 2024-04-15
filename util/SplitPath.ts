type Internal<
  TResult extends string[],
  TRest extends string
> = TRest extends `${infer A}/${infer B}`
  ? Internal<[...TResult, A], B>
  : [...TResult, TRest];

export type SplitPath<T extends string> = T extends `/${infer I}`
  ? Internal<[], I>
  : never;
