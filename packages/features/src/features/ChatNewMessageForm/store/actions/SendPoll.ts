import { AbstractExecutableAction } from '@experiments/framework';

import AvailabilityValidator from './AvailabilityValidator';

import type { TInstance } from '../@Model';
import type { TDependencies } from '../types';

class SendPoll extends AbstractExecutableAction<
  TInstance,
  TDependencies,
  void,
  AvailabilityValidator
> {
  public run = () => {
    return AbstractExecutableAction.resolveAsyncActionNoParams(() => {
      const text = this.instance.fields.pollToMessage();

      this.dependencies.serverApi.sendMessage(text);
      this.instance.fields.resetPoll();
    })();
  };

  protected initValidator(): void {
    this.validator = new AvailabilityValidator({ instance: this.instance });
  }
}

export default SendPoll;
