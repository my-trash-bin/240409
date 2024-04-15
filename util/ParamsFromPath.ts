type Internal<
  TResult extends string,
  TRest extends string
> = TRest extends `${infer A}/${infer B}`
  ? A extends `:${infer I}`
    ? Internal<TResult | I, B>
    : Internal<TResult, B>
  : TRest extends `:${infer I}`
  ? TResult | I
  : TResult;

export type ParamsFromPath<T extends string> = T extends `/${infer I}`
  ? [Internal<never, I>] extends [never]
    ? undefined
    : Record<Internal<never, I>, string | number>
  : never;
