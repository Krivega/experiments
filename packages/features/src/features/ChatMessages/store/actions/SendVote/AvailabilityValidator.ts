import { AbstractValidatorAction } from '@experiments/framework';

import type { TInstance } from '../../@Model';
import type { TSendVoteParams } from '../types';

class AvailabilityValidator<
  T extends TInstance = TInstance,
  P extends TSendVoteParams = TSendVoteParams,
> extends AbstractValidatorAction<T, P> {
  public init(): void {
    this.addValidator(({ pollId, optionIndex }) => {
      if (this.instance.hasMultipleChoicePoll(pollId)) {
        return !this.instance.hasMyVoteForOption(pollId, optionIndex);
      }

      return !this.instance.hasMyVoteForPoll(pollId);
    });
  }
}

export default AvailabilityValidator;
