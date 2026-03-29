import { FilterFieldBase } from '@experiments/components';

import { formatMessage, messagesDescriptors } from '../../../../../../shared/translations';

type TProps = {
  testid: string;
  value: string;
  onBlur: () => void;
  onChange: (value: string) => void;
};

const PollOptionAddField: React.FC<TProps> = ({ testid, value, onBlur, onChange }) => {
  return (
    <FilterFieldBase
      placeholder={formatMessage(messagesDescriptors.pollAddOption)}
      testid={testid}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
    />
  );
};

export default PollOptionAddField;
