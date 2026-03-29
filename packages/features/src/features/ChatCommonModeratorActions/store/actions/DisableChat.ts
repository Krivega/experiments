import { AbstractExecutableAction } from '@experiments/framework';

import type { TInstance } from '../@Model';
import type { TDependencies } from '../types';

class DisableChat extends AbstractExecutableAction<TInstance, TDependencies> {
  public run = () => {
    return this.dependencies.serverApi.disableChat();
  };

  protected beforeRun(): void {
    this.dependencies.coreApi.hideAllNotifications();
    this.instance.startDisableChatAction();
  }

  protected handleSuccessAction(): void {
    this.dependencies.coreApi.chatDisabled();
  }

  protected handleErrorAction(): void {
    this.dependencies.coreApi.showErrorFailedToDisableChat();
  }

  protected handleFinallyAction(): void {
    this.instance.endDisableChatAction();
  }
}

export default DisableChat;
