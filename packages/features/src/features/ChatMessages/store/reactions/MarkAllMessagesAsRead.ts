import { BaseReaction } from '@experiments/framework';
import { whenAlways } from '@experiments/mst-tools';

import type { TInstance } from '../@Model';
import type { TDependencies } from '../types';

class MarkAllMessagesAsRead extends BaseReaction<TInstance, TDependencies> {
  public run() {
    return whenAlways(this.hasAvailableToMarkAllMessagesAsRead, () => {
      this.debug('marking all messages as read');

      this.instance.markAllAsRead();
    });
  }

  private readonly hasAvailableToMarkAllMessagesAsRead = () => {
    const isShown = this.dependencies.coreApi.hasShown();

    return isShown && this.instance.isUnreadMessages;
  };
}

export default MarkAllMessagesAsRead;
