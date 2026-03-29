import { BaseWidgetComposer } from '@experiments/framework';

import type { TStore } from '../store';
import type { TPropsView } from '../ui';
import type { TComposition, TFeatures } from './types';

class Composer extends BaseWidgetComposer<TPropsView, TStore, TFeatures, TComposition> {
  private readonly isPollsEnabled: boolean;

  public constructor(
    params: { store: TStore; features: TFeatures },
    config?: {
      isPollsEnabled?: boolean;
    },
  ) {
    super(params);
    this.isPollsEnabled = config?.isPollsEnabled ?? false;
  }

  public createPropsView(): TPropsView {
    return {
      hasNoContent: this.store.state.hasNotSynced,
      hasNotAvailable: this.store.state.hasNotAvailable,
      hasLoading: this.hasLoading,
      hasBanned: this.store.state.hasBanned,
      hasModerator: this.store.state.hasModerator,
      hasEnabledModeratorActions: this.hasEnabledModeratorActions,
    };
  }

  public createComposition() {
    return {
      ChatMessagesList: this.composeFeature('chatMessagesList'),
      CommonModeratorActions: this.composeFeature('commonModeratorActions'),
      EnableChatAction: this.composeFeature('enableChatAction'),
      ChatCountUnreadMessages: this.composeFeature('chatCountUnreadMessages'),
      ChatNewMessageForm: this.composeChatNewMessageForm(),
    };
  }

  private composeFeature(featureName: keyof typeof this.features) {
    const { Component } = this.features[featureName];

    return Component;
  }

  private composeChatNewMessageForm(): TComposition['ChatNewMessageForm'] {
    const { Component } = this.features.chatNewMessageForm;

    const baseProps = { isPollsEnabled: this.isPollsEnabled };

    return this.createFeatureWrapper(Component, baseProps);
  }

  private readonly hasLoading = () => {
    return this.store.state.hasSyncInProgress() || this.store.state.hasAvailable();
  };

  private readonly hasEnabledModeratorActions = () => {
    return this.store.state.hasActive() && this.store.state.hasModerator();
  };
}

export default Composer;
