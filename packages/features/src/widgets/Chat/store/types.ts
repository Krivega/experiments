import type { TInstance } from './@Model';
import type { TDisposer } from '../../../shared/reactions';
import type { TApiMethod } from '../../../shared/serverApi';

export interface IServerApi {
  startChat: () => void;
  stopChat: () => void;
  requestCheckChat: () => TApiMethod<boolean>;
  requestSetName: (name: string) => TApiMethod;
  onBan: (callback: () => void) => TDisposer;
  onLiftBan: (callback: () => void) => TDisposer;
  onError: (callback: (error: unknown) => void) => TDisposer;
  hasAbortedError: (error: unknown) => boolean;
}

export interface ICoreApi {
  getRequestInterval: () => number;
  getName: () => string | undefined;
  hasModerator: () => boolean;
  onAvailableToStartChat: (callbacks: {
    onAvailable: () => void;
    onNotAvailable: () => void;
  }) => TDisposer;
}

export type TDependencies = {
  serverApi: IServerApi;
  coreApi: ICoreApi;
};

export type TActionParams = {
  instance: TInstance;
  dependencies: TDependencies;
};
