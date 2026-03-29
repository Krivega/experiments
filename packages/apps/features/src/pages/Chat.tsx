/* eslint-disable react/no-multi-comp */
import { Heading, LayoutContent } from '@experiments/components';
import { Chat, ChatProvider } from '@experiments/features';
import Box from '@mui/material/Box';
import { useMemo, useEffect } from 'react';

import type { TApiMethod, TCoreApiChat, TServerApiChat } from '@experiments/features';

type TInitialStateMessage = {
  id: string;
  my: boolean;
  text: string;
  timestamp: number;
  title: string;
  isRead: boolean;
};

const CONTEXT_ID = 'story';

/** Delay (ms) before emitting sample messages in the story to avoid flash of empty state */
const SAMPLE_MESSAGES_EMIT_DELAY_MS = 500;

/** Radix for random ID string (base-36: 0-9, a-z) */
const RANDOM_ID_RADIX = 36;
/** Start index for substring (skip "0." prefix from Math.random()) */
const RANDOM_ID_SUBSTRING_START = 2;
/** End index for substring (7 chars after "0.") */
const RANDOM_ID_SUBSTRING_END = 9;

/** One minute in milliseconds */
const ONE_MINUTE_MS = 60_000;
/** Thirty seconds in milliseconds */
const THIRTY_SECONDS_MS = 30_000;

const createWidgetServerApi = () => {
  return {
    startChat: () => {},
    stopChat: () => {},
    requestCheckChat: (): TApiMethod<boolean> => {
      return {
        promise: Promise.resolve(true),
        abort: () => {},
      };
    },
    requestSetName: (_name: string): TApiMethod => {
      return {
        promise: Promise.resolve(),
        abort: () => {},
      };
    },
    onBan: (_callback: () => void) => {
      return () => {};
    },
    onLiftBan: (_callback: () => void) => {
      return () => {};
    },
    onError: (_callback: (error: unknown) => void) => {
      return () => {};
    },
    hasAbortedError: (_error: unknown) => {
      return false;
    },
  };
};

const createWidgetCoreApi = () => {
  return {
    getRequestInterval: () => {
      return 1000;
    },
    getName: () => {
      return 'Story User';
    },
    hasModerator: () => {
      return true;
    },
    onAvailableToStartChat: (callbacks: {
      onAvailable: () => void;
      onNotAvailable: () => void;
    }) => {
      queueMicrotask(() => {
        callbacks.onAvailable();
      });

      return () => {};
    },
  };
};

const createChatMessagesServerApi = () => {
  let messages: TInitialStateMessage[] = [];
  let onReceiveMessagesCallback: ((messages: TInitialStateMessage[]) => void) | undefined;

  const emit = (next: TInitialStateMessage[]) => {
    messages = next;
    onReceiveMessagesCallback?.(messages);
  };

  return {
    deleteMessage: (id: string) => {
      emit(
        messages.filter((m) => {
          return m.id !== id;
        }),
      );
    },
    onReceiveMessages: (callback: (messages: TInitialStateMessage[]) => void) => {
      onReceiveMessagesCallback = callback;

      return () => {
        onReceiveMessagesCallback = undefined;
      };
    },
    emitMessages: (next: TInitialStateMessage[]) => {
      emit(next);
    },
    appendMessage: (message: TInitialStateMessage) => {
      emit([...messages, message]);
    },
  };
};

const createChatMessagesCoreApi = () => {
  return {
    hasShown: () => {
      return false;
    },
    notifyAboutOneNewMessage: () => {},
    notifyAboutManyNewMessages: () => {},
  };
};

const createChatNewMessageFormServerApi = (
  chatMessagesServerApi: ReturnType<typeof createChatMessagesServerApi>,
) => {
  return {
    sendMessage: (text: string) => {
      const newMessage: TInitialStateMessage = {
        text,
        id: `sent-${Date.now()}-${Math.random().toString(RANDOM_ID_RADIX).slice(RANDOM_ID_SUBSTRING_START, RANDOM_ID_SUBSTRING_END)}`,
        my: true,
        timestamp: Date.now(),
        title: 'Я',
        isRead: true,
      };

      chatMessagesServerApi.appendMessage(newMessage);
    },
  };
};

const createChatCommonModeratorActionsServerApi = () => {
  return {
    enableChat: () => {
      return { promise: Promise.resolve(), abort: () => {} };
    },
    disableChat: () => {
      return { promise: Promise.resolve(), abort: () => {} };
    },
    clearChat: () => {
      return { promise: Promise.resolve(), abort: () => {} };
    },
  };
};

const createChatCommonModeratorActionsCoreApi = () => {
  return {
    showErrorFailedToDisableChat: () => {},
    showErrorFailedToEnableChat: () => {},
    showErrorFailedToClearChat: () => {},
    hideAllNotifications: () => {},
  };
};

const createSampleMessages = (): TInitialStateMessage[] => {
  const now = Date.now();

  return [
    {
      id: '1',
      my: true,
      text: 'Привет!',
      timestamp: now - ONE_MINUTE_MS,
      title: 'Я',
      isRead: true,
    },
    {
      id: '2',
      my: false,
      text: 'Ответ',
      timestamp: now - THIRTY_SECONDS_MS,
      title: 'Собеседник',
      isRead: false,
    },
    {
      id: '3',
      my: true,
      text: 'Ещё сообщение с https://example.com',
      timestamp: now,
      title: 'Я',
      isRead: true,
    },
  ];
};

const createMocks = () => {
  const widgetServerApi = createWidgetServerApi();
  const widgetCoreApi = createWidgetCoreApi();
  const chatMessagesServerApi = createChatMessagesServerApi();
  const chatMessagesCoreApi = createChatMessagesCoreApi();
  const chatNewMessageFormServerApi = createChatNewMessageFormServerApi(chatMessagesServerApi);
  const chatCommonModeratorActionsServerApi = createChatCommonModeratorActionsServerApi();
  const chatCommonModeratorActionsCoreApi = createChatCommonModeratorActionsCoreApi();

  const serverApi: TServerApiChat = {
    ...widgetServerApi,
    ...chatMessagesServerApi,
    ...chatNewMessageFormServerApi,
    ...chatCommonModeratorActionsServerApi,
  };

  const coreApi: TCoreApiChat = {
    ...widgetCoreApi,
    ...chatMessagesCoreApi,
    ...chatCommonModeratorActionsCoreApi,
  };

  return {
    serverApi,
    coreApi,
    chatMessagesServerApi,
  };
};

const SampleMessages = () => {
  const mocks = useMemo(createMocks, []);

  useEffect(() => {
    const t = setTimeout(() => {
      mocks.chatMessagesServerApi.emitMessages(createSampleMessages());
    }, SAMPLE_MESSAGES_EMIT_DELAY_MS);

    return () => {
      clearTimeout(t);
    };
  }, [mocks.chatMessagesServerApi]);

  return (
    <ChatProvider
      isPollsEnabled
      contextId={CONTEXT_ID}
      coreApi={mocks.coreApi}
      serverApi={mocks.serverApi}
    >
      <Chat contextId={CONTEXT_ID} />
    </ChatProvider>
  );
};

const ChatPage = () => {
  return (
    <LayoutContent column>
      <Heading type="body1">Chat</Heading>

      <Box sx={{ mt: 2 }}>
        <SampleMessages />
      </Box>
    </LayoutContent>
  );
};

export default ChatPage;
