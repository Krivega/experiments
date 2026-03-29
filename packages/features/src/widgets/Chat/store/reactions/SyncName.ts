import { BaseReaction } from '@experiments/framework';
import { whenElseAlways } from '@experiments/mst-tools';

import type { TInstance } from '../@Model';
import type { TDependencies } from '../types';

class SyncName extends BaseReaction<TInstance, TDependencies> {
  public run() {
    const disposer = whenElseAlways(
      () => {
        return this.instance.isAvailable;
      },
      () => {
        this.executableActions.setName.execute();
      },
      () => {
        this.executableActions.setName.cancel();
      },
    );

    return () => {
      disposer();

      this.executableActions.setName.cancel();
    };
  }
}

export default SyncName;
