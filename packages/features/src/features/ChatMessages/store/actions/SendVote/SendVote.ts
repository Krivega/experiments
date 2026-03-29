import { AbstractExecutableAction } from '@experiments/framework';

import AvailabilityValidator from './AvailabilityValidator';

import type { TInstance } from '../../@Model';
import type { TDependencies } from '../../types';
import type { TSendVoteParams } from '../types';

class SendVote extends AbstractExecutableAction<
  TInstance,
  TDependencies,
  TSendVoteParams,
  AvailabilityValidator
> {
  public run = ({ pollId, optionIndex }: TSendVoteParams) => {
    return AbstractExecutableAction.resolveAsyncActionNoParams(() => {
      const { sendMessage } = this.dependencies.serverApi;
      const text = this.instance.voteToMessage(pollId, optionIndex);

      sendMessage(text);
    })();
  };

  protected initValidator(): void {
    this.validator = new AvailabilityValidator({ instance: this.instance });
  }
}

export default SendVote;
