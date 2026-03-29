import type { TInstance } from './@Model';

export interface IServerApi {
  sendMessage: (text: string) => void;
}

export type TDependencies = {
  serverApi: IServerApi;
  coreApi: undefined;
};

export type TActionParams = {
  instance: TInstance;
  dependencies: TDependencies;
};
