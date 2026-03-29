import type { TInitialStateMessage, TInstance } from './@Model';

type TDisposer = () => void;

export interface IServerApi {
  deleteMessage: (messageId: string) => void;
  onReceiveMessages: (callback: (messages: TInitialStateMessage[]) => void) => TDisposer;
  sendMessage: (text: string) => void;
}

type TUnreadMessage = {
  title: string;
  text: string;
};

export interface ICoreApi {
  hasShown: () => boolean;
  hasAvailable: () => boolean;
  notifyAboutOneNewMessage: (message: TUnreadMessage) => void;
  notifyAboutManyNewMessages: (messages: TUnreadMessage[]) => void;
}

export type TDependencies = {
  serverApi: IServerApi;
  coreApi: ICoreApi;
};

export type TActionParams = {
  instance: TInstance;
  dependencies: TDependencies;
};
