import type { TInstance } from './@Model';
import type { TApiMethod } from '../../../shared/serverApi';

export interface IServerApi {
  enableChat: () => TApiMethod;
  disableChat: () => TApiMethod;
  clearChat: () => TApiMethod;
}

export interface ICoreApi {
  showErrorFailedToDisableChat: () => void;
  showErrorFailedToEnableChat: () => void;
  showErrorFailedToClearChat: () => void;
  hideAllNotifications: () => void;
  chatEnabled: () => void;
  chatDisabled: () => void;
}

export type TDependencies = {
  serverApi: IServerApi;
  coreApi: ICoreApi;
};

export type TActionParams = {
  instance: TInstance;
  dependencies: TDependencies;
};
