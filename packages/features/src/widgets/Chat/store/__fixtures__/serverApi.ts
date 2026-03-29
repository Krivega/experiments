/* eslint-disable @typescript-eslint/class-methods-use-this */
import type { IServerApi } from '../types';

type TListenerBan = Parameters<IServerApi['onBan']>[0];
type TListenerLiftBan = Parameters<IServerApi['onLiftBan']>[0];
type TListenerError = Parameters<IServerApi['onError']>[0];

class ServerApi implements IServerApi {
  private handleBan: TListenerBan | undefined;

  private handleLiftBan: TListenerLiftBan | undefined;

  private handleError: TListenerError | undefined;

  private isFailAllRequests = false;

  private data = { isEnabled: true };

  public startChat = (): void => {
    // Mock implementation
  };

  public stopChat = (): void => {
    // Mock implementation
  };

  public requestCheckChat = () => {
    return this.sendMockRequest(this.data.isEnabled);
  };

  public requestSetName = () => {
    return this.sendMockRequest(undefined);
  };

  public hasAbortedError = (): boolean => {
    return false;
  };

  public onBan = (callback: TListenerBan) => {
    this.handleBan = callback;

    return () => {
      this.handleBan = undefined;
    };
  };

  public onLiftBan = (callback: TListenerLiftBan) => {
    this.handleLiftBan = callback;

    return () => {
      this.handleLiftBan = undefined;
    };
  };

  public onError = (callback: TListenerError) => {
    this.handleError = callback;

    return () => {
      this.handleError = undefined;
    };
  };

  public emitBan = () => {
    this.handleBan?.();
  };

  public emitLiftBan = () => {
    this.handleLiftBan?.();
  };

  public emitError = (error: unknown) => {
    this.handleError?.(error);
  };

  public setFailAllRequests = () => {
    this.isFailAllRequests = true;
  };

  public reset = () => {
    this.isFailAllRequests = false;
  };

  public setData = (data: { isEnabled: boolean }) => {
    this.data = data;
  };

  private readonly sendMockRequest = <T = unknown>(data: T) => {
    if (this.isFailAllRequests) {
      return {
        promise: Promise.reject(new Error('Failed')),
        abort: () => {
          // Mock implementation
        },
      };
    }

    return {
      promise: Promise.resolve(data),
      abort: () => {
        // Mock implementation
      },
    };
  };
}

export { ServerApi };
