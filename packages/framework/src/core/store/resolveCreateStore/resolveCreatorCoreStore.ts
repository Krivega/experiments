/* eslint-disable @typescript-eslint/max-params */
import type { IAnyModelType } from 'mobx-state-tree';
import type {
  TActions,
  TActionsWrapped,
  TCreateActions,
  TCreateStore,
  TRunReactions,
  TStore,
  TStoreAll,
} from './types';

const resolveCreatorCoreStore = <M extends IAnyModelType>(createStore: TCreateStore<M>) => {
  type TStoreWrapped = Record<string, TStore<M> | null>;
  type TCreateActionsWrapped = (store: TStoreAll, coreActions: TActions) => TActionsWrapped;
  type TReturnCreatorStore = {
    wrappedStore: TStoreWrapped;
    runReactions: TRunReactions;
    afterAllCreate: TRunReactions;
    createActions: TCreateActionsWrapped;
  };

  const creatorStore = (
    storeName: string,
    options: Parameters<TCreateStore<M>>[0],
    runnerOptions: {
      runReactions: TRunReactions;
      afterAllCreate?: TRunReactions;
      createActions?: TCreateActions;
    },
    hasAvailable: () => boolean = () => {
      return true;
    },
  ) => {
    return (): TReturnCreatorStore => {
      const {
        runReactions,
        afterAllCreate = () => {
          return undefined;
        },
        createActions = () => {
          return {};
        },
      } = runnerOptions;
      const wrappedStore: TStoreWrapped = {
        // eslint-disable-next-line unicorn/no-null
        [storeName]: hasAvailable() ? createStore(options) : null,
      };
      const wrappedCreateActions: TCreateActionsWrapped = (allStores, coreActions) => {
        return {
          [storeName]: hasAvailable() ? createActions(allStores, coreActions) : {},
        };
      };
      const maybeRunReactions = (store: TStoreAll, actions: TActionsWrapped) => {
        if (hasAvailable()) {
          runReactions(store, actions);
        }
      };
      const maybeAfterAllCreate = (store: TStoreAll, actions: TActionsWrapped) => {
        if (hasAvailable()) {
          afterAllCreate(store, actions);
        }
      };

      return {
        wrappedStore,
        runReactions: maybeRunReactions,
        afterAllCreate: maybeAfterAllCreate,
        createActions: wrappedCreateActions,
      };
    };
  };

  return creatorStore;
};

export default resolveCreatorCoreStore;
