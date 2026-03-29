/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TExtractType } from '@experiments/mst-tools';
import type { IAnyModelType, SnapshotIn } from 'mobx-state-tree';

export type TStore<T extends IAnyModelType> = TExtractType<T>;

export type TActions = Record<
  string,
  ((...arguments_: any[]) => any) | Record<string, (...arguments_: any[]) => any>
>;

type TGetEnvironment = (coreActions: TActions) => object;

export type TStoreAll = Record<string, TStore<IAnyModelType>>;

export type TCreateActions<TAllActions extends TActions = TActions> = (
  store: TStoreAll,
  allActions: TAllActions,
) => TActions;

export type TActionsWrapped = Record<string, TActions>;

export type TRunReactions = (store: TStoreAll, actions: TActionsWrapped) => void;

export type TCreateStore<M extends IAnyModelType> = (options?: {
  env?: object;
  getEnv?: TGetEnvironment;
  initialState?: SnapshotIn<M>;
  savedInitialState?: SnapshotIn<M>;
  afterCreate?: (store: TStore<M>) => void;
}) => TStore<M>;
