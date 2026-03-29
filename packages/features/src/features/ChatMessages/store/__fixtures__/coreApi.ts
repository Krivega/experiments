/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/class-methods-use-this */

import { action, makeObservable, observable } from 'mobx';

import type { ICoreApi } from '../types';

class CoreApi implements ICoreApi {
  public isAvailable = false;

  public isShown = false;

  public notifyAboutOneNewMessage = (): void => {
    // Mock implementation
  };

  public notifyAboutManyNewMessages = (): void => {
    // Mock implementation
  };

  public constructor() {
    makeObservable(this, {
      isShown: observable,
      isAvailable: observable,
      setIsShown: action,
      setIsAvailable: action,
    });
  }

  public hasShown = () => {
    return this.isShown;
  };

  public hasAvailable = () => {
    return this.isAvailable;
  };

  public setIsShown = (value: boolean) => {
    this.isShown = value;
  };

  public setIsAvailable = (value: boolean) => {
    this.isAvailable = value;
  };
}

export { CoreApi };
