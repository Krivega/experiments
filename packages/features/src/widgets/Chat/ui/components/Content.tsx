import { MessengerLayout } from '@experiments/components';
import { observer } from 'mobx-react';

import ChatNotAvailable from './ChatNotAvailable';

type TProps = {
  hasNotAvailable: () => boolean;
  hasBanned: () => boolean;
  hasModerator: () => boolean;
  EnableChatAction: React.ComponentType;
  MessagesList: React.ComponentType;
  NewMessageForm: React.ComponentType;
};

const Content: React.FC<TProps> = ({
  hasNotAvailable,
  hasBanned,
  hasModerator,
  EnableChatAction,
  MessagesList,
  NewMessageForm,
}) => {
  if (hasNotAvailable()) {
    return <ChatNotAvailable EnableChatAction={EnableChatAction} hasModerator={hasModerator} />;
  }

  return (
    <MessengerLayout>
      <MessagesList />

      {hasBanned() ? undefined : <NewMessageForm />}
    </MessengerLayout>
  );
};

export default observer(Content);
