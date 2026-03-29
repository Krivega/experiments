import { MessageList } from '@experiments/components';
import { observer } from 'mobx-react';

import { useAutoScroll } from './hooks';
import LinkifyMessage from './LinkifyMessage';
import { PollMessage } from './PollMessage';
import testIds from './testIds';

import type { TFeedItem } from './types';

type TProps = {
  getFeedItems: () => TFeedItem[];
  hasMyVoteForPoll: (pollId: string) => boolean;
  hasAvailableResetVote: (pollId: string) => boolean;
  onDelete: (messageId: string) => void;
  onVote: (pollId: string, optionIndex: number) => void;
  onResetVote: (pollId: string) => void;
};

const Messages: React.FC<TProps> = ({
  getFeedItems,
  hasMyVoteForPoll,
  hasAvailableResetVote,
  onDelete,
  onVote,
  onResetVote,
}) => {
  const items = getFeedItems();

  const { ref } = useAutoScroll(items);

  const renderedMessages = items.map((item) => {
    if (item.type === 'message') {
      return (
        <LinkifyMessage
          author={item.author}
          id={item.id}
          isDeletable={item.isDeletable}
          key={item.id}
          text={item.text}
          timestamp={item.timestamp}
          onDelete={onDelete}
        />
      );
    }

    return (
      <PollMessage
        author={item.author}
        hasAvailableResetVote={hasAvailableResetVote}
        hasMyVoteForPoll={hasMyVoteForPoll}
        isDeletable={item.isDeletable}
        key={item.messageId}
        messageId={item.messageId}
        mode={item.mode}
        options={item.options}
        pollId={item.pollId}
        question={item.question}
        timestamp={item.timestamp}
        votesByOptionIndex={item.votesByOptionIndex}
        onDelete={onDelete}
        onResetVote={onResetVote}
        onVote={onVote}
      />
    );
  });

  return (
    <MessageList ref={ref} testid={testIds.allMessagesChat}>
      {renderedMessages}
    </MessageList>
  );
};

export default observer(Messages);
