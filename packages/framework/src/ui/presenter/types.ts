export type TDestroy = () => void;

export type IBaseStore = Record<string, unknown> & {
  destroy: () => void;
};

export type TErrorMessagesDefault = Record<
  string,
  { type: string; values?: Record<string, string> }
>;

export type TStateFieldModel<V> = {
  getValue: () => V;
  setValue: (value: V) => void;
  hasDisabled: () => boolean;
};

export type TFormFieldModel<V, E = string> = TStateFieldModel<V> & {
  getError: () => E | undefined;
  hasValid: () => boolean;
};

export type TStateFieldView<V> = {
  getValue: () => V;
  onChange: (value: V) => void;
  hasDisabled: () => boolean;
};

export type TFormFieldView<V, E = string> = TStateFieldView<V> & {
  getError: () => E | undefined;
  hasValid: () => boolean;
};

export type TExecutableAction<TExecuteArgs extends unknown[] = []> = {
  execute: (...args: TExecuteArgs) => void;
  canExecute: (...args: TExecuteArgs) => boolean;
};

export type TActionPropsView<TExecuteArgs extends unknown[] = []> = {
  onClick: (...args: TExecuteArgs) => void;
  hasDisabled: (...args: TExecuteArgs) => boolean;
};
