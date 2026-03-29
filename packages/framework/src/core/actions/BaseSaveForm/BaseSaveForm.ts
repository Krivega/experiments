import { AbstractExecutableAction } from '../AbstractExecutableAction';
import CanSaveValidator from './CanSaveValidator';

import type { TBaseInstance, TDependencies } from './types';

export abstract class BaseSaveForm<
  P = unknown,
  R = unknown,
  T extends TBaseInstance<Partial<P>> = TBaseInstance<Partial<P>>,
  D extends TDependencies<P, R> = TDependencies<P, R>,
> extends AbstractExecutableAction<T, D, void, CanSaveValidator<T>> {
  public run() {
    const data = this.getSaveData();

    return this.callServerApi(data);
  }

  protected initValidator() {
    this.validator = new CanSaveValidator({ instance: this.instance });
  }

  protected beforeRun(): void {
    this.dependencies.coreApi.hideAllNotifications();
    this.instance.setSaveInProgress();
  }

  protected handleSuccessAction(): void {
    this.dependencies.coreApi.showSuccessSavingForm();
    this.instance.rememberState();
  }

  protected handleErrorAction(error: unknown): void {
    if (!this.dependencies.serverApi.hasAbortedError(error)) {
      this.dependencies.coreApi.showFailedToSaveFormError();
    }

    this.instance.setSaveError();
  }

  protected callServerApi(data: P): { promise: Promise<R>; abort: () => void } {
    return this.dependencies.serverApi.setData(data);
  }

  protected getSaveData(): P {
    return this.instance.fields.currentState as P;
  }
}
