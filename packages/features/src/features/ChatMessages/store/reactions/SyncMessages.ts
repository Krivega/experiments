import { BaseReaction } from '@experiments/framework';
import { whenElseAlways } from '@experiments/mst-tools';

import type { TInstance } from '../@Model';
import type { TDependencies } from '../types';

class SyncMessages extends BaseReaction<TInstance, TDependencies> {
  public run() {
    let disposeReceiveMessages: (() => void) | undefined;

    const handleAvailable = () => {
      disposeReceiveMessages?.();

      disposeReceiveMessages = this.dependencies.serverApi.onReceiveMessages((messages) => {
        this.debug('update messages', { count: messages.length });
        this.instance.setMessages(messages);
      });
    };

    const handleNotAvailable = () => {
      this.debug('clear messages');
      this.instance.clearMessages();

      disposeReceiveMessages?.();
    };

    const disposeStatus = whenElseAlways(
      this.dependencies.coreApi.hasAvailable,
      handleAvailable,
      handleNotAvailable,
    );

    return () => {
      disposeStatus();
      disposeReceiveMessages?.();
    };
  }
}

export default SyncMessages;
