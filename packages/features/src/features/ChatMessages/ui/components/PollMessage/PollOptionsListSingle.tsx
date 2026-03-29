import { List, IndentationContainer, Button } from '@experiments/components';
import { memo, useCallback, useState } from 'react';

import PollOptionVoteSingle from './PollOptionVoteSingle';
import { formatMessage, messagesDescriptors } from '../../../../../shared/translations';

const PollOptionsListSingle: React.FC<{
  pollId: string;
  options: string[];
  votesByOptionIndex: Record<number, string[] | undefined>;
  onVote: (pollId: string, optionIndex: number) => void;
}> = ({ pollId, options, onVote }) => {
  const [selectedOption, setSelectedOption] = useState<number | undefined>(undefined);

  const handleSubmitVote = useCallback(() => {
    if (selectedOption !== undefined) {
      onVote(pollId, selectedOption);
    }
  }, [pollId, onVote, selectedOption]);

  const isSelection = selectedOption !== undefined;

  return (
    <>
      <List compact>
        {options.map((optionText, optionIndex) => {
          return (
            <IndentationContainer
              bottom={false}
              bottomSize="small"
              // eslint-disable-next-line react/no-array-index-key
              key={optionIndex}
              left={false}
              right={false}
              top={false}
            >
              <PollOptionVoteSingle
                isChecked={selectedOption === optionIndex}
                optionText={optionText}
                pollId={pollId}
                onToggle={(checked) => {
                  if (checked) {
                    setSelectedOption(optionIndex);
                  }
                }}
              />
            </IndentationContainer>
          );
        })}
      </List>

      <IndentationContainer left={false} right={false} top={false} topSize="small">
        <Button raised rounded disabled={!isSelection} size="wide" onClick={handleSubmitVote}>
          {formatMessage(messagesDescriptors.chatPollVote)}
        </Button>
      </IndentationContainer>
    </>
  );
};

export default memo(PollOptionsListSingle);
