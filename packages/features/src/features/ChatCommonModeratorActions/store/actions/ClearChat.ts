import { AbstractExecutableAction } from '@experiments/framework';

import type { TInstance } from '../@Model';
import type { TDependencies } from '../types';

class ClearChat extends AbstractExecutableAction<TInstance, TDependencies> {
  public run = () => {
    return this.dependencies.serverApi.clearChat();
  };

  protected beforeRun(): void {
    this.dependencies.coreApi.hideAllNotifications();
    this.instance.startClearChatAction();
  }

  protected handleErrorAction(): void {
    this.dependencies.coreApi.showErrorFailedToClearChat();
  }

  protected handleFinallyAction(): void {
    this.instance.endClearChatAction();
  }
}

export default ClearChat;
