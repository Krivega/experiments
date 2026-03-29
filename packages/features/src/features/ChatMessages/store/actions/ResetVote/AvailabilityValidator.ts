import { AbstractValidatorAction } from '@experiments/framework';

import type { TInstance } from '../../@Model';
import type { TResetVoteParams } from '../types';

class AvailabilityValidator<
  T extends TInstance = TInstance,
  P extends TResetVoteParams = TResetVoteParams,
> extends AbstractValidatorAction<T, P> {
  public init(): void {
    this.addValidator(({ pollId }) => {
      return this.instance.hasMyVoteForPoll(pollId);
    });
  }
}

export default AvailabilityValidator;
