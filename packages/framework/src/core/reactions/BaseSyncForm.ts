import { BaseReaction } from './BaseReaction';

import type { TBaseExecutableActions } from './types';

export interface ISyncFormInstance<TData extends { state: unknown; dependentData?: unknown }> {
  setSyncInProgress: () => void;
  setSyncError: () => void;
  isSaveInProgress: boolean;
  fill: (state: TData['state'], dependentData?: TData['dependentData']) => void;
}

export interface IServerApi<TData = unknown> {
  getData: () => { promise: Promise<TData>; abort: () => void };
}

export interface IOptions<TData = unknown> {
  subscribeData?: (callback: (event: TData) => void) => () => void;
}

type TBaseDependencies<TData> = { serverApi: IServerApi<TData>; coreApi?: unknown };

export abstract class BaseSyncForm<
  TData extends { state: unknown; dependentData?: unknown },
  TInstance extends ISyncFormInstance<TData> = ISyncFormInstance<TData>,
  TDependencies extends TBaseDependencies<TData> = TBaseDependencies<TData>,
  TExecutableActions extends TBaseExecutableActions = TBaseExecutableActions,
> extends BaseReaction<TInstance, TDependencies, TExecutableActions> {
  protected unsubscribe: (() => void) | undefined = undefined;

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

    this.subscribeData = options.subscribeData;
  }

  protected run() {
    this.unsubscribe?.();
    this.instance.setSyncInProgress();

    const { promise, abort } = this.dependencies.serverApi.getData();

    promise
      .then((data) => {
        this.handleSuccess(data);
      })
      .catch((error: unknown) => {
        this.handleError(error);
      });

    return (): void => {
      this.unsubscribe?.();
      abort();
    };
  }

  protected hasAvailableWriteFromSocket = () => {
    return !this.instance.isSaveInProgress;
  };

  protected writeFromSocket = (data: TData) => {
    if (this.hasAvailableWriteFromSocket()) {
      this.writeFunction(data);
    }
  };

  protected handleSuccess(data: TData): void {
    this.debug('success:', data);
    this.writeFunction(data);
    this.unsubscribe = this.subscribeData?.(this.writeFromSocket);
  }

  protected writeFunction = (data: TData) => {
    this.instance.fill(data.state, data.dependentData);
  };

  protected handleError(error: unknown): void {
    this.debug('error:', error);
    this.instance.setSyncError();
  }
}
