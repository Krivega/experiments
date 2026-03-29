import type { IAnyModelType, Instance } from 'mobx-state-tree';

export type TOptions<R> = {
  onSuccess?: (response: R) => void;
  onError?: (error: unknown) => void;
  onFinally?: () => void;
};

export type TBaseDependencies = Partial<Record<'serverApi' | 'coreApi', unknown>>;

export type TParams<
  T extends Instance<IAnyModelType> = Instance<IAnyModelType>,
  D extends TBaseDependencies = TBaseDependencies,
> = {
  instance: T;
  dependencies: D;
};
