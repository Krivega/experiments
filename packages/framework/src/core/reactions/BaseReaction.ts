import { debugResolve } from '../../utils/logger';

import type { IAnyModelType, Instance } from 'mobx-state-tree';
import type { TBaseExecutableActions } from './types';

type TDisposer = () => void;
type TBaseDependencies = Partial<Record<'serverApi' | 'coreApi', unknown>>;

export abstract class BaseReaction<
  TInstance extends Instance<IAnyModelType>,
  TDependencies extends TBaseDependencies = TBaseDependencies,
  TExecutableActions extends TBaseExecutableActions = TBaseExecutableActions,
> {
  protected readonly debug = debugResolve(this.constructor.name);

  protected readonly dependencies: TDependencies;

  protected readonly instance: TInstance;

  protected readonly executableActions: TExecutableActions;

  private disposer: TDisposer | undefined;

  public constructor({
    instance,
    dependencies,
    executableActions,
  }: {
    instance: TInstance;
    dependencies: TDependencies;
    executableActions: TExecutableActions;
  }) {
    this.instance = instance;
    this.dependencies = dependencies;
    this.executableActions = executableActions;
  }

  public stop = (): void => {
    this.disposer?.();
  };

  public start = (): void => {
    this.stop();

    this.disposer = this.run();
  };

  protected abstract run(): TDisposer;
}
