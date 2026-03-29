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

const resolveCreatorStore = <M extends IAnyModelType>(createStore: TCreateStore<M>) => {
  type TStoreWrapped = Record<string, TStore<M> | null>;
  type TCreateActionsWrapped<TAllActions extends TActions = TActions> = (
    store: TStoreAll,
    allActions: TAllActions,
  ) => TActionsWrapped;
  type TReturnCreatorStore<TAllActions extends TActions = TActions> = {
    wrappedStore: TStoreWrapped;
    runReactions: TRunReactions;
    afterAllCreate: TRunReactions;
    createActions: TCreateActionsWrapped<TAllActions>;
  };

  const creatorStore = <
    // TCoreActions — тип может отличаться от TAllActions по составу от TAllActions
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    TCoreActions extends TActions = TActions,
    TAllActions extends TActions = TActions,
  >(
    storeName: string,
    options: Parameters<TCreateStore<M>>[0],
    runnerOptions: {
      runReactions: TRunReactions;
      afterAllCreate?: TRunReactions;
      createActions?: TCreateActions<TAllActions>;
    },
    hasAvailable: () => boolean = () => {
      return true;
    },
  ) => {
    return (coreActions: TCoreActions): TReturnCreatorStore<TAllActions> => {
      const {
        runReactions,
        afterAllCreate = () => {
          return undefined;
        },
        createActions = () => {
          return {};
        },
      } = runnerOptions;

      const environment = options?.getEnv?.(coreActions);
      const wrappedStore: TStoreWrapped = {
        // eslint-disable-next-line unicorn/no-null
        [storeName]: hasAvailable() ? createStore({ env: environment, ...options }) : null,
      };
      const wrappedCreateActions: TCreateActionsWrapped<TAllActions> = (allStores, allActions) => {
        return {
          [storeName]: hasAvailable() ? createActions(allStores, allActions) : {},
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

export default resolveCreatorStore;
