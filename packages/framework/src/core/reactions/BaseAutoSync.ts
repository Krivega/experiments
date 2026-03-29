import { SetTimeoutRequest } from '@experiments/timeout-requester';

import { BaseReaction } from './BaseReaction';

import type { TBaseExecutableActions } from './types';

const MAX_RETRY_COUNT = 150;
const REQUEST_INTERVAL_MS = 2000;

export interface IAutoSyncInstance<TData extends { state: unknown; dependentData?: unknown }> {
  setSyncInProgress: () => void;
  setSyncError: () => void;
  setSyncRetry: () => void;
  isSyncRetry: boolean;
  isSaveInProgress?: boolean;
  fill: (state: TData['state'], dependentData?: TData['dependentData']) => void;
}

export interface IServerApi<TData = unknown> {
  getData: () => { promise: Promise<TData>; abort: () => void };
}

export interface IOptions<TData = unknown> {
  requestInterval?: number;
  subscribeData?: (callback: (event: TData) => void) => () => void;
  maxRetryCount?: number;
}

type TBaseDependencies<TData> = { serverApi: IServerApi<TData>; coreApi?: unknown };

export abstract class BaseAutoSync<
  TData extends { state: unknown; dependentData?: unknown },
  TInstance extends IAutoSyncInstance<TData> = IAutoSyncInstance<TData>,
  TDependencies extends TBaseDependencies<TData> = TBaseDependencies<TData>,
  TExecutableActions extends TBaseExecutableActions = TBaseExecutableActions,
> extends BaseReaction<TInstance, TDependencies, TExecutableActions> {
  protected unsubscribe: (() => void) | undefined = undefined;

  protected abort: (() => void) | undefined = undefined;

  private retryCounter = 0;

  private readonly maxRetryCount: number;

  private readonly requestInterval: number;

  private readonly timeoutRequester = new SetTimeoutRequest();

  private readonly subscribeData?: (callback: (event: TData) => void) => () => void;

  public constructor(
    {
      instance,
      dependencies,
      executableActions,
    }: {
      instance: TInstance;
      dependencies: TDependencies;
      executableActions: TExecutableActions;
    },
    options: IOptions<TData> = {},
  ) {
    super({ instance, dependencies, executableActions });

    this.requestInterval = options.requestInterval ?? REQUEST_INTERVAL_MS;
    this.subscribeData = options.subscribeData;
    this.maxRetryCount = options.maxRetryCount ?? MAX_RETRY_COUNT;
  }

  public run(): () => void {
    this.unsubscribe?.();
    this.instance.setSyncInProgress();

    this.syncWithRetry();

    return (): void => {
      this.debug('Aborted sync');

      this.timeoutRequester.cancelRequest();

      this.unsubscribe?.();
      this.abort?.();
    };
  }

  protected syncWithRetry = () => {
    const { promise, abort } = this.dependencies.serverApi.getData();

    this.abort = abort;

    promise
      .then((data) => {
        this.handleSuccess(data);
      })
      .catch((error: unknown) => {
        this.handleError(error);
      });
  };

  protected writeFunction = (data: TData) => {
    this.instance.fill(data.state, data.dependentData);
  };

  protected hasAvailableWriteFromSocket = () => {
    return this.instance.isSaveInProgress !== true;
  };

  protected writeFromSocket = (data: TData) => {
    if (this.hasAvailableWriteFromSocket()) {
      this.writeFunction(data);
    }
  };

  protected handleSuccess(data: TData): void {
    this.debug('success:', data);

    this.resetRetryCounter();
    this.writeFunction(data);
    this.unsubscribe = this.subscribeData?.(this.writeFromSocket);
  }

  protected handleError(error: unknown): void {
    this.debug('error:', error);

    if (this.hasMaxedRetryCounter()) {
      this.instance.setSyncError();
      this.resetRetryCounter();
    } else {
      this.instance.setSyncRetry();
      this.incrementRetryCounter();
      this.syncWithRetryWithDelay();
    }
  }

  protected syncWithRetryWithDelay() {
    this.timeoutRequester.request(this.syncWithRetry, this.requestInterval);
  }

  private incrementRetryCounter() {
    this.retryCounter += 1;
  }

  private resetRetryCounter() {
    this.retryCounter = 0;
  }

  private hasMaxedRetryCounter(): boolean {
    return this.retryCounter >= this.maxRetryCount;
  }
}
