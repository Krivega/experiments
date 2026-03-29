import { Store } from '@experiments/framework';

import { Model } from './@Model';
import { ClearChat, DisableChat, EnableChat } from './actions';

import type { TInstance } from './@Model';
import type { TActionParams, TDependencies } from './types';

const createStore = (dependencies: TDependencies) => {
  const store = new Store(
    () => {
      return Model.create();
    },
    {
      dependencies,
      reactions: [],
      executableActionFactories: {
        enableChat: (parameters: TActionParams) => {
          return new EnableChat(parameters);
        },
        disableChat: (parameters: TActionParams) => {
          return new DisableChat(parameters);
        },
        clearChat: (parameters: TActionParams) => {
          return new ClearChat(parameters);
        },
      },
      instanceToPublicAPI: (instance: TInstance) => {
        return {
          hasEnableChatInProgress: () => {
            return instance.isEnableChatInProgress;
          },
          hasDisableChatInProgress: () => {
            return instance.isDisableChatInProgress;
          },
          hasClearChatInProgress: () => {
            return instance.isClearChatInProgress;
          },
        };
      },
    },
  );

  return store.getPublicAPI();
};

export type TStore = ReturnType<typeof createStore>;

export default createStore;
