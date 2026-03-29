import { BasePresenter } from '@experiments/framework';

import type { TStore } from '../store';
import type { TPropsView } from '../ui';

class Presenter extends BasePresenter<TPropsView, TStore> {
  public createPropsView = (): TPropsView => {
    return {
      hasEnableChatInProgress: this.store.state.hasEnableChatInProgress,
      hasDisableChatInProgress: this.store.state.hasDisableChatInProgress,
      hasClearChatInProgress: this.store.state.hasClearChatInProgress,
      onEnableChat: this.onEnableChat,
      onDisableChat: this.onDisableChat,
      onClearChat: this.onClearChat,
    };
  };

  private readonly onEnableChat = () => {
    this.store.executableActions.enableChat.execute(undefined);
  };

  private readonly onDisableChat = () => {
    this.store.executableActions.disableChat.execute(undefined);
  };

  private readonly onClearChat = () => {
    this.store.executableActions.clearChat.execute(undefined);
  };
}

export default Presenter;
