import { BaseReaction } from '@experiments/framework';
import { resolveRequesterByTimeout } from '@experiments/timeout-requester';

import type { TInstance } from '../@Model';
import type { TDependencies } from '../types';

class SyncStatus extends BaseReaction<TInstance, TDependencies> {
  private checkChatRequester:
    | ReturnType<typeof resolveRequesterByTimeout<Promise<void>>>
    | undefined;

  private disposeError: (() => void) | undefined;

  public run() {
    const { coreApi } = this.dependencies;

    this.checkChatRequester = resolveRequesterByTimeout<Promise<void>>({
      requestInterval: coreApi.getRequestInterval(),
      isDontStopOnFail: true,
      request: this.requestCheckChat,
    });

    const disposeAvailableToStartChat = coreApi.onAvailableToStartChat({
      onAvailable: this.startSync,
      onNotAvailable: this.stopSync,
    });

    return () => {
      disposeAvailableToStartChat();

      this.stopSync();
    };
  }

  private readonly startSync = () => {
    this.debug('startSync');

    this.stopSync();

    this.checkChatRequester?.start();

    this.subscribeToError();
  };

  private readonly stopSync = () => {
    this.debug('stopSync');

    this.checkChatRequester?.stop();

    this.executableActions.checkChat.cancel();

    this.unsubscribeFromError();

    this.instance.setNotSynced();
  };

  private readonly subscribeToError = () => {
    this.disposeError = this.dependencies.serverApi.onError((error) => {
      this.debug('chat error', error);

      this.startSync();
    });
  };

  private readonly unsubscribeFromError = () => {
    this.disposeError?.();
    this.disposeError = undefined;
  };

  private readonly requestCheckChat = async () => {
    return new Promise<void>((resolve, reject) => {
      this.executableActions.checkChat.execute(undefined, {
        onSuccess: resolve,
        onError: reject,
      });
    });
  };
}

export default SyncStatus;
