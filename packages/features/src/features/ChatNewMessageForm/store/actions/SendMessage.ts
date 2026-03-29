import { AbstractExecutableAction } from '@experiments/framework';

import type { TInstance } from '../@Model';
import type { TDependencies } from '../types';

class SendMessage extends AbstractExecutableAction<TInstance, TDependencies> {
  public run = () => {
    return AbstractExecutableAction.resolveAsyncActionNoParams(() => {
      const { textMessage } = this.instance.currentState;

      if (this.instance.canSave()) {
        this.dependencies.serverApi.sendMessage(textMessage);
        this.instance.reset();
      }
    })();
  };
}

export default SendMessage;
