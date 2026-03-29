import { RadioWithFormField } from '@experiments/components';
import { memo } from 'react';

export type TPollOptionVoteSingleProps = {
  pollId: string;
  isChecked: boolean;
  optionText: string;
  onToggle: (checked: boolean) => void;
};

const PollOptionVoteSingle: React.FC<TPollOptionVoteSingleProps> = ({
  pollId,
  isChecked,
  optionText,
  onToggle,
}) => {
  return (
    <RadioWithFormField checked={isChecked} label={optionText} name={pollId} onChange={onToggle} />
  );
};

export default memo(PollOptionVoteSingle);
