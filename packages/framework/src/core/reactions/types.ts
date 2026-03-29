// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TBaseAction = (...args: any[]) => unknown;

export type TBaseActions = Record<string, TBaseAction>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TBaseExecutableAction<TExecuteArgs extends any[] = any[]> = {
  cancel: () => void;
  canExecute: (...args: TExecuteArgs) => boolean;
  execute: (...args: TExecuteArgs) => void;
};

export type TBaseExecutableActions = Record<string, TBaseExecutableAction>;
