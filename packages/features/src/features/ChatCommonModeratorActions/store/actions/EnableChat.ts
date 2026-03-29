import { AbstractExecutableAction } from '@experiments/framework';

import type { TInstance } from '../@Model';
import type { TDependencies } from '../types';

class EnableChat extends AbstractExecutableAction<TInstance, TDependencies> {
  public run = () => {
    return this.dependencies.serverApi.enableChat();
  };

  protected beforeRun(): void {
    this.dependencies.coreApi.hideAllNotifications();
    this.instance.startEnableChatAction();
  }

  protected handleSuccessAction(): void {
    this.dependencies.coreApi.chatEnabled();
  }

  protected handleErrorAction(): void {
    this.dependencies.coreApi.showErrorFailedToEnableChat();
  }

  protected handleFinallyAction(): void {
    this.instance.endEnableChatAction();
  }
}

export default EnableChat;
