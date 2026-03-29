import { ModelAction } from '@experiments/framework';
import { types as typesMST } from 'mobx-state-tree';

import type { TInstanceModel } from '@experiments/mst-tools';

const Model = typesMST
  .model({
    enableChatAction: typesMST.optional(ModelAction, {}),
    disableChatAction: typesMST.optional(ModelAction, {}),
    clearChatAction: typesMST.optional(ModelAction, {}),
  })
  .views((self) => {
    return {
      get isEnableChatInProgress(): boolean {
        return self.enableChatAction.isActionInProgress;
      },
      get isDisableChatInProgress(): boolean {
        return self.disableChatAction.isActionInProgress;
      },
      get isClearChatInProgress(): boolean {
        return self.clearChatAction.isActionInProgress;
      },
    };
  })
  .actions((self) => {
    const startEnableChatAction = () => {
      self.enableChatAction.startAction();
    };

    const startDisableChatAction = () => {
      self.disableChatAction.startAction();
    };

    const startClearChatAction = () => {
      self.clearChatAction.startAction();
    };

    const endEnableChatAction = () => {
      self.enableChatAction.endAction();
    };

    const endDisableChatAction = () => {
      self.disableChatAction.endAction();
    };

    const endClearChatAction = () => {
      self.clearChatAction.endAction();
    };

    return {
      startEnableChatAction,
      startDisableChatAction,
      startClearChatAction,
      endEnableChatAction,
      endDisableChatAction,
      endClearChatAction,
    };
  });

export type TInstance = TInstanceModel<typeof Model>;

export default Model;
