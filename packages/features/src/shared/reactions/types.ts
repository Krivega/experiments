type TBaseExecutableAction = {
  canExecute: () => boolean;
  execute: () => void;
  cancel: () => void;
};

type TBaseExecutableActions = Record<string, TBaseExecutableAction>;

export type TParametersReaction<
  TInstance,
  TDependencies,
  TExecutableActions extends TBaseExecutableActions = TBaseExecutableActions,
> = {
  instance: TInstance;
  dependencies: TDependencies;
  executableActions: TExecutableActions;
};

export type TDisposer = () => void;
