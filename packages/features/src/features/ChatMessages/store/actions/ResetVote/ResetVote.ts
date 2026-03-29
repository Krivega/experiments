import { AbstractExecutableAction } from '@experiments/framework';

import AvailabilityValidator from './AvailabilityValidator';

import type { TInstance } from '../../@Model';
import type { TParsedMessageWithMeta } from '../../@Model/types';
import type { TDependencies } from '../../types';
import type { TResetVoteParams } from '../types';

class ResetVote extends AbstractExecutableAction<
  TInstance,
  TDependencies,
  TResetVoteParams,
  AvailabilityValidator
> {
  public run = ({ pollId }: TResetVoteParams) => {
    return AbstractExecutableAction.resolveAsyncActionNoParams(() => {
      const instanceWithMethod = this.instance as TInstance & {
        myVotesForPoll: (pollId: string) => TParsedMessageWithMeta[];
      };

      const myVotes = instanceWithMethod.myVotesForPoll(pollId);

      myVotes.forEach(({ id }) => {
        this.debug('deleting my vote message:', id);
        this.dependencies.serverApi.deleteMessage(id);
      });
    })();
  };

  protected initValidator(): void {
    this.validator = new AvailabilityValidator({ instance: this.instance });
  }
}

export default ResetVote;
