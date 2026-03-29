import { usePresenter } from '@experiments/framework';

import { Presenter } from './presenter';
import { ViewChatCountUnreadMessages, ViewChatMessagesList } from './ui';
import useStore from './useStore';
import { createMultipleContext } from '../../shared/context';

import type { TPropsView } from './ui';

type TPropsProvider = Parameters<typeof useStore>[0] & {
  children: React.ReactNode;
  contextId: string;
};

const { Provider, withContext } = createMultipleContext<TPropsView>();

export const ChatMessagesProvider = ({
  serverApi,
  coreApi,
  contextId,
  children,
}: TPropsProvider) => {
  const store = useStore({ serverApi, coreApi });
  const propsView = usePresenter(Presenter, { store });

  return (
    <Provider contextId={contextId} value={propsView}>
      {children}
    </Provider>
  );
};

export const ChatMessagesList = withContext(ViewChatMessagesList);
export const ChatCountUnreadMessages = withContext(ViewChatCountUnreadMessages);
