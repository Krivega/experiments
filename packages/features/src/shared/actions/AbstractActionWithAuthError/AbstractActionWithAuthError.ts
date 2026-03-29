import { BaseAction } from '@experiments/framework';

import type { TApiMethod } from '@/shared/serverApi';

type TBaseInstance = {
  isActionInProgress: boolean;
  startAction: () => void;
  endAction: () => void;
};

export type TCoreApi = {
  showErrorAction: () => void;
  showErrorActionUnauthorized?: () => void;
  hideAllNotifications: () => void;
};

export type TServerApiBase<TResponse> = {
  request: () => TApiMethod<TResponse>;
  hasAbortedError: (error: unknown) => boolean;
  hasUnauthorizedError?: (error: unknown) => boolean;
};

abstract class AbstractActionWithAuthError<
  TResponse,
  TInstance extends TBaseInstance,
  TServerApi extends TServerApiBase<TResponse> = TServerApiBase<TResponse>,
  TDependencies extends { coreApi: TCoreApi; serverApi: TServerApi } = {
    coreApi: TCoreApi;
    serverApi: TServerApi;
  },
> extends BaseAction<void, TResponse, TInstance, TDependencies> {
  declare protected readonly dependencies: TDependencies;

  protected get serverApi(): TServerApi {
    return this.dependencies.serverApi;
  }

  protected handleErrorAction(error: unknown): void {
    if (this.serverApi.hasAbortedError(error)) {
      return;
    }

    if (this.serverApi.hasUnauthorizedError?.(error) ?? false) {
      this.dependencies.coreApi.showErrorActionUnauthorized?.();

      return;
    }

    this.dependencies.coreApi.showErrorAction();
  }
}

export default AbstractActionWithAuthError;
