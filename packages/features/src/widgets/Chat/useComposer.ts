import { useComposer as useComposerShared } from '@experiments/framework';
import { useMemo } from 'react';

import { Composer } from './composer';

import type {
  TChatCountUnreadMessagesComposition,
  TChatMessagesListComposition,
  TChatNewMessageFormComposition,
  TCommonModeratorActionsComposition,
  TEnableChatActionComposition,
  TFeatures,
} from './composer';
import type { TStore } from './store';

const useComposer = (
  store: TStore,
  components: {
    ChatMessagesListComponent: React.ComponentType<TChatMessagesListComposition>;
    CommonModeratorActionsComponent: React.ComponentType<TCommonModeratorActionsComposition>;
    EnableChatActionComponent: React.ComponentType<TEnableChatActionComposition>;
    ChatNewMessageFormComponent: React.ComponentType<TChatNewMessageFormComposition>;
    ChatCountUnreadMessagesComponent: React.ComponentType<TChatCountUnreadMessagesComposition>;
  },
  dependencies: {
    isPollsEnabled?: boolean;
  },
) => {
  const features: TFeatures = useMemo(() => {
    return {
      chatMessagesList: { Component: components.ChatMessagesListComponent },
      commonModeratorActions: { Component: components.CommonModeratorActionsComponent },
      enableChatAction: { Component: components.EnableChatActionComponent },
      chatNewMessageForm: { Component: components.ChatNewMessageFormComponent },
      chatCountUnreadMessages: { Component: components.ChatCountUnreadMessagesComponent },
    };
  }, [components]);

  return useComposerShared(
    (props) => {
      return new Composer(props, { isPollsEnabled: dependencies.isPollsEnabled });
    },
    { store, features },
  );
};

export default useComposer;
