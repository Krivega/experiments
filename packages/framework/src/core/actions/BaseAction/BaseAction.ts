import { AbstractExecutableAction } from '../AbstractExecutableAction';
import ActionInProgressValidator from './ActionInProgressValidator';

import type { TBaseInstance, TDependencies } from './types';

export abstract class BaseAction<
  P = unknown,
  R = unknown,
  T extends TBaseInstance = TBaseInstance,
  D extends TDependencies<P, R> = TDependencies<P, R>,
> extends AbstractExecutableAction<T, D, P, ActionInProgressValidator<T, P>> {
  public run(params: P) {
    return this.dependencies.serverApi.request(params);
  }

  protected initValidator(): void {
    this.validator = new ActionInProgressValidator<T, P>({ instance: this.instance });
  }

  protected beforeRun(): void {
    this.instance.startAction();
    this.dependencies.coreApi.hideAllNotifications();
  }

  protected handleSuccessAction(_response: R): void {
    this.dependencies.coreApi.showSuccessAction?.();
  }

  protected handleErrorAction(error: unknown): void {
    if (!this.dependencies.serverApi.hasAbortedError(error)) {
      this.dependencies.coreApi.showErrorAction();
    }
  }

  protected handleFinallyAction(): void {
    this.instance.endAction();
  }
}
