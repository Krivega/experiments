import { AbstractValidatorAction } from '../AbstractValidatorAction';

import type { TBaseInstance } from './types';

class CanSaveValidator<T extends TBaseInstance, P = void> extends AbstractValidatorAction<T, P> {
  public init(): void {
    this.addValidator(() => {
      return this.instance.canSave();
    });
  }
}

export default CanSaveValidator;
