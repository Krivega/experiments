import { Message, UserAvatar, FieldBox } from '@experiments/components';
import { dateUtils, uiUtils } from '@experiments/utils';
import { memo, useCallback } from 'react';

import PollBody from './PollBody';
import PollQuestion from './PollQuestion';
import { formatMessage, messagesDescriptors } from '../../../../../shared/translations';
import testIds from '../testIds';

import type { TPollMode } from '../../../../../shared/voteEncoding';

export type TProps = {
  author: string;
  hasAvailableResetVote: (pollId: string) => boolean;
  hasMyVoteForPoll: (pollId: string) => boolean;
  isDeletable: boolean;
  messageId: string;
  mode: TPollMode;
  options: string[];
  pollId: string;
  question: string;
  timestamp: number;
  votesByOptionIndex: Record<number, string[] | undefined>;
  onDelete: (messageId: string) => void;
  onResetVote: (pollId: string) => void;
  onVote: (pollId: string, optionIndex: number) => void;
};

const PollMessage: React.FC<TProps> = ({
  author,
  hasAvailableResetVote,
  hasMyVoteForPoll,
  isDeletable,
  messageId,
  mode,
  options,
  pollId,
  question,
  timestamp,
  votesByOptionIndex,
  onDelete,
  onResetVote,
  onVote,
}) => {
  const date = dateUtils.toLocaleDateString(timestamp);
  const initials = uiUtils.getInitialsFromName(author);

  const handleDelete = useCallback(() => {
    onDelete(messageId);
  }, [messageId, onDelete]);

  return (
    <Message
      showAvatar
      author={author}
      avatar={<UserAvatar>{initials}</UserAvatar>}
      date={date}
      deleteButton={isDeletable}
      deleteButtonTitle={formatMessage(messagesDescriptors.chatDeleteMessage)}
      renderCopyTextAction={() => {
        return undefined;
      }}
      testidDeleteMessageIcon={testIds.deleteMessageIcon}
      testidMessageAuthor={testIds.messageAuthor}
      testidMessageBody={testIds.pollMessageBody}
      testidMessageText={testIds.pollMessageText}
      onDeleteClick={handleDelete}
    >
      <FieldBox>
        <PollQuestion question={question} />

        <PollBody
          hasResetVote={hasAvailableResetVote(pollId)}
          isVoted={hasMyVoteForPoll(pollId)}
          mode={mode}
          options={options}
          pollId={pollId}
          votesByOptionIndex={votesByOptionIndex}
          onResetVote={onResetVote}
          onVote={onVote}
        />
      </FieldBox>
    </Message>
  );
};

export default memo(PollMessage);
