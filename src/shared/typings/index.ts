type _Tuple<
  T,
  Count extends number,
  Buff extends T[]
> = Buff["length"] extends Count ? Buff : _Tuple<T, Count, [T, ...Buff]>;

export type Tuple<T, Count extends number> = _Tuple<T, Count, []>;

export type LastTupleElement<T extends any[]> = T extends [...any[], infer L]
  ? L
  : never;

export type PickByTemplate<T, Template> = {
  [K in Extract<keyof T, Template>]: T[K];
};
