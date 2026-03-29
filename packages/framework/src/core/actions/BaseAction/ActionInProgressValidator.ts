import { AbstractValidatorAction } from '../AbstractValidatorAction';

import type { TBaseInstance } from './types';

class ActionInProgressValidator<
  T extends TBaseInstance = TBaseInstance,
  P = void,
> extends AbstractValidatorAction<T, P> {
  public init(): void {
    this.addValidator(() => {
      return !this.instance.isActionInProgress;
    });
  }
}

export default ActionInProgressValidator;
