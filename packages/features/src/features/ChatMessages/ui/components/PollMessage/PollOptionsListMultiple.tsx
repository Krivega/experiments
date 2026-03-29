import { Button, IndentationContainer, List } from '@experiments/components';
import { memo, useCallback, useState } from 'react';

import PollOptionVoteMultiple from './PollOptionVoteMultiple';
import { formatMessage, messagesDescriptors } from '../../../../../shared/translations';

const PollOptionsListMultiple: React.FC<{
  pollId: string;
  options: string[];
  onVote: (pollId: string, optionIndex: number) => void;
}> = ({ pollId, options, onVote }) => {
  const [selectedOptionIndices, setSelectedOptionIndices] = useState<Set<number>>(() => {
    return new Set();
  });

  const handleToggle = useCallback((optionIndex: number, checked: boolean) => {
    setSelectedOptionIndices((prev) => {
      const next = new Set(prev);

      if (checked) {
        next.add(optionIndex);
      } else {
        next.delete(optionIndex);
      }

      return next;
    });
  }, []);

  const handleSubmitVote = useCallback(() => {
    selectedOptionIndices.forEach((optionIndex) => {
      onVote(pollId, optionIndex);
    });

    setSelectedOptionIndices(new Set());
  }, [pollId, onVote, selectedOptionIndices]);

  const isSelection = selectedOptionIndices.size > 0;

  return (
    <>
      <List compact>
        {options.map((optionText, optionIndex) => {
          return (
            <IndentationContainer
              bottomSize="small"
              // eslint-disable-next-line react/no-array-index-key
              key={optionIndex}
              left={false}
              right={false}
              top={false}
            >
              <PollOptionVoteMultiple
                isChecked={selectedOptionIndices.has(optionIndex)}
                optionText={optionText}
                onToggle={(checked) => {
                  handleToggle(optionIndex, checked);
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

export default memo(PollOptionsListMultiple);
