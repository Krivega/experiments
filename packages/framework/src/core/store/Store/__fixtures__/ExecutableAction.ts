import ValidatorAction from './ValidatorAction';
import { AbstractExecutableAction } from '../../../actions';

import type { TStoreDependencies } from './storeDependencies';
import type { TInstanceTodo } from './TodoModel';

class ExecutableAction extends AbstractExecutableAction<
  TInstanceTodo,
  TStoreDependencies,
  Parameters<TStoreDependencies['serverApi']['patchData']>[0],
  ValidatorAction
> {
  public cancelMock = jest.fn();

  public run(params: Parameters<TStoreDependencies['serverApi']['patchData']>[0]) {
    return {
      promise: this.dependencies.serverApi.patchData(params),
      abort: () => {
        this.cancelMock();
      },
    };
  }

  protected initValidator(): void {
    this.validator = new ValidatorAction({ instance: this.instance });
  }

  protected beforeRun(): void {
    this.instance.toggle();
    this.dependencies.coreApi.hideAllNotifications();
  }

  protected handleErrorAction(): void {
    this.dependencies.coreApi.notifyErrorAction();
  }

  protected handleErrorValidation(): void {
    this.dependencies.coreApi.notifyErrorActionValidation();
  }
}

export default ExecutableAction;
