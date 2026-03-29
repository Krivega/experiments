import { MessageForm } from '@experiments/components';
import { observer } from 'mobx-react';

import { formatMessage, messagesDescriptors } from '@/shared/translations';
import testIds from './testIds';

import type { TFields } from './types';

type TProps = {
  getTextMessageField: TFields['getTextMessageField'];
  onSend: () => void;
  maxCharacters?: number;
  children?: React.ReactNode;
};

const DEFAULT_MAX_CHARACTERS = 500;

const Form = ({
  getTextMessageField,
  onSend,
  children,
  maxCharacters = DEFAULT_MAX_CHARACTERS,
}: TProps) => {
  const { getValue, onChange } = getTextMessageField();

  return (
    <MessageForm
      maxInputLength={maxCharacters}
      placeholder={formatMessage(messagesDescriptors.chatTextareaPlaceholder)}
      testidMessageInput={testIds.messageInputChat}
      testidSendMessageIcon={testIds.sendMessageIconChat}
      value={getValue()}
      onChange={onChange}
      onSend={onSend}
    >
      {children}
    </MessageForm>
  );
};

export default observer(Form);
