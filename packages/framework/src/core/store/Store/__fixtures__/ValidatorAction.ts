import { AbstractValidatorAction } from '../../../actions';

import type { TStoreDependencies } from './storeDependencies';
import type { TInstanceTodo } from './TodoModel';

class ValidatorAction extends AbstractValidatorAction<
  TInstanceTodo,
  Parameters<TStoreDependencies['serverApi']['patchData']>[0]
> {
  public init(): void {
    this.addValidator(() => {
      return !this.instance.done;
    });
  }
}

export default ValidatorAction;
