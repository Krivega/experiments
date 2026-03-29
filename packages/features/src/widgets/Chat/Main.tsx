import { useMemo } from 'react';

import {
  ChatCommonModeratorActionsProvider,
  CommonModeratorActions,
  EnableChatAction,
  testIdsChatCommonModeratorActions,
  ChatMessagesList,
  ChatMessagesProvider,
  ChatCountUnreadMessages as FeatureChatCountUnreadMessages,
  testIdsChatMessages,
  ChatNewMessageForm,
  testIdsChatNewMessageForm,
} from '@/features';
import { withDependencies } from '@/shared/composition';
import { createMultipleContext, withContextId } from '@/shared/context';
import { ViewChat, ViewChatCountUnreadMessages, testIds } from './ui';
import useComposer from './useComposer';
import useStore from './useStore';

import type {
  ICoreApiChatCommonModeratorActions,
  IServerApiChatCommonModeratorActions,
  ICoreApiChatMessages,
  IServerApiChatMessages,
  IServerApiChatNewMessageForm,
} from '@/features';
import type { TFeatures, TPropsView } from './ui';

type TContext = TPropsView & {
  features: TFeatures;
};

type TWidgetDependencies = Parameters<typeof useStore>[0];

type TFullCoreApi = TWidgetDependencies['coreApi'] &
  ICoreApiChatCommonModeratorActions &
  ICoreApiChatMessages;

export type TServerApi = TWidgetDependencies['serverApi'] &
  IServerApiChatMessages &
  IServerApiChatNewMessageForm &
  IServerApiChatCommonModeratorActions;

export type TCoreApi = Omit<TFullCoreApi, 'hasAvailable' | 'chatEnabled' | 'chatDisabled'>;

type TDependencies = {
  serverApi: TServerApi;
  coreApi: TCoreApi;
};

type TPropsProvider = TDependencies & {
  children: React.ReactNode;
  contextId: string;
  isPollsEnabled?: boolean;
};

const getComponents = (dependencies: TDependencies, contextId: string) => {
  return {
    ChatNewMessageFormComponent: withDependencies(ChatNewMessageForm, dependencies),
    ChatMessagesListComponent: withContextId(ChatMessagesList, contextId),
    CommonModeratorActionsComponent: withContextId(CommonModeratorActions, contextId),
    EnableChatActionComponent: withContextId(EnableChatAction, contextId),
    ChatCountUnreadMessagesComponent: withContextId(FeatureChatCountUnreadMessages, contextId),
  };
};

const { Provider, withContext } = createMultipleContext<TContext>();

const useComponents = ({ serverApi, coreApi }: TDependencies, contextId: string) => {
  return useMemo(() => {
    return getComponents({ serverApi, coreApi }, contextId);
  }, [serverApi, coreApi, contextId]);
};

export const ChatProvider = ({
  serverApi,
  coreApi,
  contextId,
  children,
  isPollsEnabled,
}: TPropsProvider) => {
  const store = useStore({ serverApi, coreApi });
  const components = useComponents({ serverApi, coreApi }, contextId);

  const { composition: features, propsView } = useComposer(store, components, { isPollsEnabled });

  const providerValue = useMemo(() => {
    return { ...propsView, features };
  }, [propsView, features]);

  const coreApiChatMessages = useMemo(() => {
    return {
      ...coreApi,
      hasAvailable: store.state.hasActivated,
    };
  }, [coreApi, store]);

  const coreApiChatCommonModeratorActions = useMemo(() => {
    return {
      ...coreApi,
      chatEnabled: store.state.setAvailable,
      chatDisabled: store.state.setNotAvailable,
    };
  }, [coreApi, store]);

  return (
    <Provider contextId={contextId} value={providerValue}>
      <ChatMessagesProvider
        contextId={contextId}
        coreApi={coreApiChatMessages}
        serverApi={serverApi}
      >
        <ChatCommonModeratorActionsProvider
          contextId={contextId}
          coreApi={coreApiChatCommonModeratorActions}
          serverApi={serverApi}
        >
          {children}
        </ChatCommonModeratorActionsProvider>
      </ChatMessagesProvider>
    </Provider>
  );
};

export const Chat = withContext(ViewChat);
export const ChatCountUnreadMessages = withContext(ViewChatCountUnreadMessages);

export const testIdsChat = {
  ...testIds,
  ...testIdsChatMessages,
  ...testIdsChatNewMessageForm,
  ...testIdsChatCommonModeratorActions,
};
