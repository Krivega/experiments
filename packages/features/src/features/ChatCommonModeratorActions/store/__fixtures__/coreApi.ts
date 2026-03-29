/* eslint-disable @typescript-eslint/class-methods-use-this */

import type { ICoreApi } from '../types';

export class CoreApi implements ICoreApi {
  public showErrorFailedToDisableChat = (): void => {
    // Mock implementation
  };

  public showErrorFailedToEnableChat = (): void => {
    // Mock implementation
  };

  public showErrorFailedToClearChat = (): void => {
    // Mock implementation
  };

  public hideAllNotifications = (): void => {
    // Mock implementation
  };

  public chatEnabled = (): void => {
    // Mock implementation
  };

  public chatDisabled = (): void => {
    // Mock implementation
  };
}

export default CoreApi;
