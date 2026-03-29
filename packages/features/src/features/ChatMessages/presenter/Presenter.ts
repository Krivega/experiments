import { BasePresenter } from '@experiments/framework';

import type { TStore } from '../store';
import type { TPropsView, TFeedItem } from '../ui';

class Presenter extends BasePresenter<TPropsView, TStore> {
  public createPropsView = (): TPropsView => {
    return {
      getFeedItems: this.getFeedItems,
      getCountUnreadMessages: this.store.state.getCountUnreadMessages,
      hasUnreadMessages: this.store.state.hasUnreadMessages,
      hasMyVoteForPoll: this.store.state.hasMyVoteForPoll,
      hasAvailableResetVote: this.hasAvailableResetVote,
      onDeleteMessage: this.store.executableActions.deleteMessage.execute,
      onVote: this.handleVote,
      onResetVote: this.handleResetVote,
    };
  };

  private readonly handleVote = (pollId: string, optionIndex: number): void => {
    this.store.executableActions.sendVote.execute({ pollId, optionIndex });
  };

  private readonly handleResetVote = (pollId: string): void => {
    this.store.executableActions.resetVote.execute({ pollId });
  };

  // private readonly hasAvailableVote = (pollId: string, optionIndex?: number): boolean => {
  //   return this.store.executableActions.sendVote.canExecute({ pollId, optionIndex });
  // };

  private readonly hasAvailableResetVote = (pollId: string): boolean => {
    return this.store.executableActions.resetVote.canExecute({ pollId });
  };

  private readonly getFeedItems = (): TFeedItem[] => {
    return this.store.state.getFeedItems();
  };
}

export default Presenter;
