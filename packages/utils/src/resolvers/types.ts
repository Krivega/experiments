export type Callback<T = () => void> = (event: T) => void;
export type TRecordMods = number | string | symbol;
export type TDataValue = boolean | string;
export type TSettingsMods = Record<TRecordMods, boolean>;
export type TMods = TSettingsMods & TValuesMods;
export type TValuesMods = Record<TRecordMods, string>;

export type TRecordProperties<
  P extends Record<Readonly<string>, unknown>,
  T extends readonly (keyof P)[],
> = {
  [K in T[number]]-?: P[K] extends string ? unknown : P[K];
};

export type TTypeProperties<T extends readonly string[], P = unknown> = Partial<
  Record<T[number], P>
>;

export type TPayloadEvent<T, K = string> = { type: K; payload: T };
export type TPayloadAction<T, K = string> = (payload: T) => TPayloadEvent<T, K>;
export type TActionHandler<T> = (payload: T) => void;
export type TWorkerEvent<T> = ErrorEvent | MessageEvent<T>;
export type TWorkerEventHandler<T> = (event: TWorkerEvent<T>) => void;
