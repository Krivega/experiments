import { AbstractExecutableAction } from '@experiments/framework';

import type { TInstance } from '../@Model';
import type { TDependencies } from '../types';

type TParams = string;

class DeleteMessage extends AbstractExecutableAction<TInstance, TDependencies, TParams> {
  public run(messageId: TParams) {
    return AbstractExecutableAction.resolveAsyncActionNoParams(() => {
      this.debug('deleting message:', messageId);

      this.dependencies.serverApi.deleteMessage(messageId);
    })();
  }
}

export default DeleteMessage;
