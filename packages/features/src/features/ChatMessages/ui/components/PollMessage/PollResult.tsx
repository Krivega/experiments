import { List, IndentationContainer } from '@experiments/components';
import { memo } from 'react';

import distributePollPercentages from './distributePollPercentages';
import formatEqualSplitPercentLabel from './formatEqualSplitPercentLabel';
import PollOptionResult from './PollOptionResult';

const PollResult: React.FC<{
  options: string[];
  pollId: string;
  votesByOptionIndex: Record<number, string[] | undefined>;
}> = ({ options, pollId, votesByOptionIndex }) => {
  const voteCounts = options.map((_, optionIndex) => {
    const votes = votesByOptionIndex[optionIndex] ?? [];

    return votes.length;
  });

  const allVotesCount = voteCounts.reduce((accumulator, count) => {
    return accumulator + count;
  }, 0);

  const allVoteCountsEqual =
    allVotesCount > 0 &&
    voteCounts.length > 0 &&
    voteCounts.every((count) => {
      return count === voteCounts[0];
    });

  const percents = allVoteCountsEqual
    ? []
    : distributePollPercentages(voteCounts, allVotesCount, pollId);

  return (
    <List compact>
      {options.map((optionText, optionIndex) => {
        const voteCount = voteCounts[optionIndex];
        const percentLabel = allVoteCountsEqual
          ? formatEqualSplitPercentLabel(voteCounts.length)
          : `${percents[optionIndex]}%`;

        return (
          <IndentationContainer
            bottomSize="small"
            // eslint-disable-next-line react/no-array-index-key
            key={optionIndex}
            left={false}
            right={false}
            top={false}
          >
            <PollOptionResult
              allVotesCount={allVotesCount}
              optionText={optionText}
              percentLabel={percentLabel}
              voteCount={voteCount}
            />
          </IndentationContainer>
        );
      })}
    </List>
  );
};

export default memo(PollResult);
