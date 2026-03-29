import mergeInitialStatesDefault from './mergeInitialStates';

import type { IAnyModelType, SnapshotIn } from 'mobx-state-tree';
import type { TCreateStore, TStore } from './types';

const resolveCreateStore = <M extends IAnyModelType>({
  Model,
  initialState: initialStateStore,
  env: environmentStore = {},
  afterCreate: afterCreateStore,
  mergeInitialStates = mergeInitialStatesDefault,
}: {
  Model: M;
  env?: object;
  initialState?: SnapshotIn<M>;
  afterCreate?: (store: TStore<M>) => void;
  mergeInitialStates?: typeof mergeInitialStatesDefault;
}) => {
  const createStore: TCreateStore<M> = ({
    initialState: initialStateFromParameters,
    savedInitialState,
    env: environment = {},
    afterCreate,
  }: {
    env?: object;
    initialState?: SnapshotIn<M>;
    savedInitialState?: SnapshotIn<M>;
    afterCreate?: (store: TStore<M>) => void;
  } = {}) => {
    const initialState = mergeInitialStates([
      initialStateStore ?? {},
      initialStateFromParameters ?? {},
      savedInitialState ?? {},
    ]) as SnapshotIn<M>;
    const store = Model.create(initialState, { ...environmentStore, ...environment });

    if (afterCreateStore) {
      afterCreateStore(store);
    }

    if (afterCreate) {
      afterCreate(store);
    }

    return store;
  };

  return createStore;
};

export default resolveCreateStore;
