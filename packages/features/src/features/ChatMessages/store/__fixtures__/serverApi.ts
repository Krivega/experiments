/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/class-methods-use-this */
import type { IServerApi } from '../types';

type TListenerReceiveMessages = Parameters<IServerApi['onReceiveMessages']>[0];

class ServerApi implements IServerApi {
  public deleteMessage = (): void => {
    // Mock implementation
  };

  public sendMessage = (): void => {
    // Mock implementation
  };

  public onReceiveMessages = (callback: TListenerReceiveMessages) => {
    this.handleReceiveMessages = callback;

    return () => {
      this.handleReceiveMessages = undefined;
    };
  };

  private handleReceiveMessages: TListenerReceiveMessages | undefined;

  public emitReceiveMessages = (payload: Parameters<TListenerReceiveMessages>[0]) => {
    this.handleReceiveMessages?.(payload);
  };
}

export { ServerApi };
