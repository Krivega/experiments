import { BaseReaction } from '@experiments/framework';
import { whenElseAlways } from '@experiments/mst-tools';

import type { TInstance } from '../@Model';
import type { TDependencies } from '../types';

class InitChat extends BaseReaction<TInstance, TDependencies> {
  private readonly disposers: (() => void)[] = [];

  public run() {
    const disposer = whenElseAlways(
      () => {
        return this.instance.isActivated;
      },
      this.startChat,
      this.stopChat,
    );

    return () => {
      disposer();

      this.stopChat();
    };
  }

  private readonly startChat = () => {
    this.dependencies.serverApi.startChat();
    this.subscribeToChat();
  };

  private readonly stopChat = () => {
    this.dependencies.serverApi.stopChat();
    this.unsubscribeFromChat();
  };

  private readonly subscribeToChat = () => {
    this.disposers.push(
      this.dependencies.serverApi.onBan(() => {
        this.instance.setBanned();
      }),
    );

    this.disposers.push(
      this.dependencies.serverApi.onLiftBan(() => {
        this.instance.setActive();
      }),
    );
  };

  private readonly unsubscribeFromChat = () => {
    this.disposers.forEach((dispose) => {
      dispose();
    });
    this.disposers.length = 0;
  };
}

export default InitChat;
