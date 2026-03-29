/* eslint-disable no-console */
import type { IServerApi } from '../types';

type TConfig = {
  delayRequest: number;
};

class ServerApi implements IServerApi {
  private isFailAllRequests = false;

  private readonly config: TConfig;

  public constructor(params?: Partial<TConfig>) {
    this.config = {
      delayRequest: params?.delayRequest ?? 0,
    };
  }

  public disableChat = () => {
    return this.request(undefined);
  };

  public clearChat = () => {
    return this.request(undefined);
  };

  public enableChat = () => {
    return this.request(undefined);
  };

  public setFailAllRequests = () => {
    this.isFailAllRequests = true;
  };

  public reset = () => {
    this.isFailAllRequests = false;
  };

  protected request<T>(response: T, onSuccess = () => {}) {
    let timeoutId: NodeJS.Timeout | undefined = undefined;

    let promise = new Promise<T>((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(response);
      }, this.config.delayRequest);
    });

    if (this.isFailAllRequests) {
      promise = new Promise<T>((_resolve, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('request error'));
        }, this.config.delayRequest);
      });
    }

    promise.then(onSuccess).catch(console.log);

    return {
      promise,
      abort: () => {
        clearTimeout(timeoutId);
      },
    };
  }
}

export { ServerApi };
