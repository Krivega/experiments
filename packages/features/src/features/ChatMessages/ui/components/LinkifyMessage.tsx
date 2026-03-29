import { CopyTextAction, Message, UserAvatar } from '@experiments/components';
import { dateUtils, uiUtils } from '@experiments/utils';
import Linkify from 'linkify-react';
import { memo, useCallback } from 'react';

import testIds from './testIds';
import { formatMessage, messagesDescriptors } from '../../../../shared/translations';

import type { TMessage } from './types';

const options = {
  nl2br: true,
  target: '_blank',
  validate: { email: false },
};

type TProps = TMessage & {
  onDelete: (id: string) => void;
};

const LinkifyMessage: React.FC<TProps> = ({
  id,
  text,
  timestamp,
  author,
  isDeletable,
  onDelete,
}) => {
  const date = dateUtils.toLocaleDateString(timestamp);
  const initials = uiUtils.getInitialsFromName(author);

  const handleDelete = useCallback(() => {
    onDelete(id);
  }, [id, onDelete]);

  const renderCopyTextAction = useCallback(() => {
    return (
      <CopyTextAction
        copiedMessage={formatMessage(messagesDescriptors.copied)}
        copyTextTitle={formatMessage(messagesDescriptors.copyText)}
        decodedText={text}
        testidCopyTextButton={testIds.copyTextButton}
      />
    );
  }, [text]);

  return (
    <Message
      showAvatar
      author={author}
      avatar={<UserAvatar>{initials}</UserAvatar>}
      date={date}
      deleteButton={isDeletable}
      deleteButtonTitle={formatMessage(messagesDescriptors.chatDeleteMessage)}
      renderCopyTextAction={renderCopyTextAction}
      testidDeleteMessageIcon={testIds.deleteMessageIcon}
      testidMessageAuthor={testIds.messageAuthor}
      testidMessageBody={testIds.messageBody}
      testidMessageText={testIds.messageText}
      onDeleteClick={handleDelete}
    >
      <Linkify options={options}>{text}</Linkify>
    </Message>
  );
};

export default memo(LinkifyMessage);
