import { AbstractExecutableAction } from '@experiments/framework';

import type { TInstance } from '../@Model';
import type { TDependencies } from '../types';

class CheckChat extends AbstractExecutableAction<TInstance, TDependencies> {
  public run = () => {
    return this.dependencies.serverApi.requestCheckChat();
  };

  protected beforeRun = () => {
    this.instance.setSyncInProgress();
  };

  protected handleSuccessAction = (isEnabled: boolean) => {
    const applyState = isEnabled ? this.instance.setAvailable : this.instance.setNotAvailable;

    applyState();
  };
}

export default CheckChat;
