import { CheckboxWithFormField } from '@experiments/components';
import { memo } from 'react';

const PollOptionVoteMultiple: React.FC<{
  optionText: string;
  isChecked: boolean;
  onToggle: (checked: boolean) => void;
}> = ({ optionText, isChecked, onToggle }) => {
  return <CheckboxWithFormField checked={isChecked} label={optionText} onChange={onToggle} />;
};

export default memo(PollOptionVoteMultiple);
