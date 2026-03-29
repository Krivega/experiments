import { Messages } from './components';

import type { TFeedItem } from './components';

export type TProps = {
  getFeedItems: () => TFeedItem[];
  hasMyVoteForPoll: (pollId: string) => boolean;
  hasAvailableResetVote: (pollId: string) => boolean;
  onDeleteMessage: (messageId: string) => void;
  onVote: (pollId: string, optionIndex: number) => void;
  onResetVote: (pollId: string) => void;
};

const ViewChatMessagesList: React.FC<TProps> = ({
  getFeedItems,
  hasAvailableResetVote,
  hasMyVoteForPoll,
  onDeleteMessage,
  onResetVote,
  onVote,
}) => {
  return (
    <Messages
      getFeedItems={getFeedItems}
      hasAvailableResetVote={hasAvailableResetVote}
      hasMyVoteForPoll={hasMyVoteForPoll}
      onDelete={onDeleteMessage}
      onResetVote={onResetVote}
      onVote={onVote}
    />
  );
};

export default ViewChatMessagesList;
