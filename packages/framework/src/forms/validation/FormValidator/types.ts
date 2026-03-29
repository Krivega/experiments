import type { AnyFunction } from 'xstate';

export type TKey = string | number | symbol;
export type TRule<Schema extends Record<string, unknown>, TValue> = (
  value: TValue,
  validation: TValidationSecondParameter<Schema>,
) => string | undefined;

export type TActions = {
  onError: (message: string) => void;
  onValid: () => void;
};

type TFieldSchema<Schema extends Record<string, unknown>, TValue> = {
  getRules: (rulesParams: TGetRulesParams<Schema>) => TRule<Schema, TValue>[];
  actions: TActions;
};

export type TFieldSchemas<Schema extends Record<string, unknown>, TValue> = Record<
  string,
  TFieldSchema<Schema, TValue>
>;

export type TFieldValidator<Schema extends Record<string, unknown>, TValue> = {
  validate: (value: TValue, stateDependence: TStateDependence<Schema>) => string | undefined;
};

export type TStateDependence<TSchema extends Record<string, unknown>> =
  | TGetRulesParams<TSchema>
  | TValidationFirstParameter<TSchema>
  | TValidationSecondParameter<TSchema>;

export type TGetRulesParams<TSchema extends Record<string, unknown>> = TGetParams<
  TGetRules<TSchema>
>[number];

type TValidationFirstParameter<
  TSchema extends Record<string, unknown>,
  GetRules extends TGetRules<TSchema> = TGetRules<TSchema>,
> = GetRules extends AnyFunction
  ? Record<keyof TSchema, TGetFirstParameter<ReturnType<GetRules>[number]>>
  : never;

type TValidationSecondParameter<
  TSchema extends Record<string, unknown>,
  GetRules extends TGetRules<TSchema> = TGetRules<TSchema>,
> = GetRules extends AnyFunction ? TGetSecondParameter<ReturnType<GetRules>[number]> : never;

// Utils
export type TGetParams<TFunction> = TFunction extends AnyFunction ? Parameters<TFunction> : never;
export type TGetFirstParameter<TFunction> = TFunction extends AnyFunction
  ? TGetParams<TFunction>[0]
  : never;
export type TGetSecondParameter<TFunction> = TFunction extends AnyFunction
  ? TGetParams<TFunction>[1]
  : never;

type TGetRules<TSchema> =
  TSchema[keyof TSchema] extends Record<'getRules', infer GetRules> ? GetRules : never;
