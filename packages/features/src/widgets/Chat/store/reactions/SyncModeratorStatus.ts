import { BaseReaction } from '@experiments/framework';
import { reaction } from 'mobx';

import type { TInstance } from '../@Model';
import type { TDependencies } from '../types';

class SyncModeratorStatus extends BaseReaction<TInstance, TDependencies> {
  public run() {
    return reaction(this.dependencies.coreApi.hasModerator, (isModerator) => {
      this.instance.setIsModerator(isModerator);
    });
  }
}

export default SyncModeratorStatus;
