import { Store } from '@experiments/framework';

import { Model } from './@Model';
import { CheckChat, SetName } from './actions';
import { InitChat, SyncModeratorStatus, SyncName, SyncStatus } from './reactions';

import type { TInstance } from './@Model';
import type { TDependencies } from './types';

const createStore = (dependencies: TDependencies) => {
  const store = new Store(
    () => {
      return Model.create({
        isModerator: dependencies.coreApi.hasModerator(),
      });
    },
    {
      dependencies,
      reactions: [
        (parameters) => {
          return new SyncStatus(parameters);
        },
        (parameters) => {
          return new SyncModeratorStatus(parameters);
        },
        (parameters) => {
          return new SyncName(parameters);
        },
        (parameters) => {
          return new InitChat(parameters);
        },
      ],
      executableActionFactories: {
        checkChat: (parameters) => {
          return new CheckChat(parameters);
        },
        setName: (parameters) => {
          return new SetName(parameters);
        },
      },
      instanceToPublicAPI: (instance: TInstance) => {
        return {
          hasModerator: () => {
            return instance.isModerator;
          },
          hasNotSynced: () => {
            return instance.isNotSynced;
          },
          hasSyncInProgress: () => {
            return instance.isSyncInProgress;
          },
          hasBanned: () => {
            return instance.isBanned;
          },
          hasAvailable: () => {
            return instance.isAvailable;
          },
          hasActive: () => {
            return instance.isActive;
          },
          hasActivated: () => {
            return instance.isActivated;
          },
          hasNotAvailable: () => {
            return instance.isNotAvailable;
          },
          setAvailable: () => {
            instance.setAvailable();
          },
          setNotAvailable: () => {
            instance.setNotAvailable();
          },
        };
      },
    },
  );

  return store.getPublicAPI();
};

export type TStore = ReturnType<typeof createStore>;

export default createStore;
