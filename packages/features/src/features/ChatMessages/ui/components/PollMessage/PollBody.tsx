import { useCallback } from 'react';

import PollOptionsListMultiple from './PollOptionsListMultiple';
import PollOptionsListSingle from './PollOptionsListSingle';
import PollResetVoteButton from './PollResetVoteButton';
import PollResult from './PollResult';

import type { TPollMode } from '../../../../../shared/voteEncoding';

export type TPollBodyProps = {
  hasResetVote: boolean;
  isVoted: boolean;
  mode: TPollMode;
  options: string[];
  pollId: string;
  votesByOptionIndex: Record<number, string[] | undefined>;
  onResetVote: (pollId: string) => void;
  onVote: (pollId: string, optionIndex: number) => void;
};

const PollBody: React.FC<TPollBodyProps> = ({
  hasResetVote,
  isVoted,
  mode,
  options,
  pollId,
  votesByOptionIndex,
  onResetVote,
  onVote,
}) => {
  const handleResetVote = useCallback(() => {
    onResetVote(pollId);
  }, [pollId, onResetVote]);

  const resetButton = hasResetVote ? <PollResetVoteButton onClick={handleResetVote} /> : undefined;

  if (isVoted) {
    return (
      <>
        <PollResult options={options} pollId={pollId} votesByOptionIndex={votesByOptionIndex} />

        {resetButton}
      </>
    );
  }

  if (mode === 'single') {
    return (
      <>
        <PollOptionsListSingle
          options={options}
          pollId={pollId}
          votesByOptionIndex={votesByOptionIndex}
          onVote={onVote}
        />

        {resetButton}
      </>
    );
  }

  return (
    <>
      <PollOptionsListMultiple options={options} pollId={pollId} onVote={onVote} />

      {resetButton}
    </>
  );
};

export default PollBody;
