import { Button } from '@experiments/components';
import { memo } from 'react';

import { formatMessage, messagesDescriptors } from '../../../../../shared/translations';
import testIds from '../testIds';

export type TProps = {
  onClick: () => void;
};

const PollResetVoteButton: React.FC<TProps> = ({ onClick }) => {
  return (
    <Button
      size="smallest"
      testid={testIds.pollResetVoteButton}
      title={formatMessage(messagesDescriptors.chatResetVote)}
      onClick={onClick}
    >
      {formatMessage(messagesDescriptors.chatResetVote)}
    </Button>
  );
};

export default memo(PollResetVoteButton);
