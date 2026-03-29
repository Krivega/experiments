import { Store } from '@experiments/framework';

import { Model } from './@Model';
import { DeleteMessage, ResetVote, SendVote } from './actions';
import { MarkAllMessagesAsRead, NotifyAboutUnreadMessages, SyncMessages } from './reactions';

import type { TInstance } from './@Model';
import type { TActionParams, TDependencies } from './types';

const createStore = (dependencies: TDependencies) => {
  const store = new Store(
    () => {
      return Model.create();
    },
    {
      dependencies,
      reactions: [
        (parameters) => {
          return new MarkAllMessagesAsRead(parameters);
        },
        (parameters) => {
          return new NotifyAboutUnreadMessages(parameters);
        },
        (parameters) => {
          return new SyncMessages(parameters);
        },
      ],
      executableActionFactories: {
        deleteMessage: (params: TActionParams) => {
          return new DeleteMessage(params);
        },
        sendVote: (params: TActionParams) => {
          return new SendVote(params);
        },
        resetVote: (params: TActionParams) => {
          return new ResetVote(params);
        },
      },
      instanceToPublicAPI: (instance: TInstance) => {
        return {
          getFeedItems: () => {
            return instance.feedItems;
          },
          getCountUnreadMessages: () => {
            return instance.countUnreadMessages;
          },
          hasUnreadMessages: () => {
            return instance.isUnreadMessages;
          },
          hasMyVoteForPoll: (id: string) => {
            return instance.hasMyVoteForPoll(id);
          },
        };
      },
    },
  );

  return store.getPublicAPI();
};

export type TStore = ReturnType<typeof createStore>;

export default createStore;
