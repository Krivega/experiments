import { AbstractValidatorAction } from '@experiments/framework';

import type { TInstance } from '../@Model';

class AvailabilityValidator<T extends TInstance = TInstance> extends AbstractValidatorAction<T> {
  public init(): void {
    this.addValidator(() => {
      return this.instance.fields.canSubmitPoll;
    });
  }
}

export default AvailabilityValidator;
