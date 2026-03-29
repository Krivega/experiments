import { AbstractExecutableAction } from '@experiments/framework';

import type { TInstance } from '../@Model';
import type { TDependencies } from '../types';

const SAFE_DISPLAY_NAME_LENGTH_LIMIT = 120;

const sliceName = (name: string) => {
  return name.slice(0, SAFE_DISPLAY_NAME_LENGTH_LIMIT);
};

class SetName extends AbstractExecutableAction<TInstance, TDependencies> {
  public run = () => {
    const name = this.dependencies.coreApi.getName() ?? '';

    return this.dependencies.serverApi.requestSetName(sliceName(name));
  };

  protected handleSuccessAction = () => {
    this.instance.setActive();
  };

  protected handleErrorAction = (error: unknown) => {
    if (!this.dependencies.serverApi.hasAbortedError(error)) {
      this.instance.setNotAvailable();
    }
  };
}

export default SetName;
