/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/class-methods-use-this */

import { action, makeObservable, observable } from 'mobx';

import type { ICoreApi } from '../types';

type TCallbacks = Parameters<ICoreApi['onAvailableToStartChat']>[0];

class CoreApi implements ICoreApi {
  public isModerator = false;

  public getRequestInterval = (): number => {
    return 1000;
  };

  public getName = (): string | undefined => {
    return '';
  };

  public onAvailableToStartChat = (callbacks: TCallbacks) => {
    this.handleAvailable = callbacks.onAvailable;
    this.handleNotAvailable = callbacks.onNotAvailable;

    return () => {
      this.handleAvailable = undefined;
      this.handleNotAvailable = undefined;
    };
  };

  private handleAvailable: (() => void) | undefined;

  private handleNotAvailable: (() => void) | undefined;

  public constructor() {
    makeObservable(this, {
      isModerator: observable,
      setIsModerator: action,
    });
  }

  public emitAvailable = () => {
    this.handleAvailable?.();
  };

  public emitNotAvailable = () => {
    this.handleNotAvailable?.();
  };

  public hasModerator = () => {
    return this.isModerator;
  };

  public setIsModerator = (value: boolean) => {
    this.isModerator = value;
  };
}

export { CoreApi };
