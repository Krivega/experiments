/* eslint-disable react/jsx-max-depth */
import {
  Actions,
  IndentationContainer,
  Text,
  StepperProgress,
  Action,
} from '@experiments/components';
import { memo } from 'react';

const PollOptionResult: React.FC<{
  optionText: string;
  voteCount: number;
  allVotesCount: number;
  percentLabel: string;
}> = ({ optionText, voteCount, allVotesCount, percentLabel }) => {
  const title = percentLabel;
  const countRendered = voteCount > 0 ? ` (${voteCount})` : undefined;

  return (
    <IndentationContainer bottom={false} leftSize="small" rightSize="middle" topSize="small">
      <Actions>
        <Action grow>
          <Text>
            {optionText}

            {countRendered}
          </Text>
        </Action>

        <Action noShrink>
          <Text>{title}</Text>
        </Action>
      </Actions>

      <StepperProgress current={voteCount} total={allVotesCount} />
    </IndentationContainer>
  );
};

export default memo(PollOptionResult);
