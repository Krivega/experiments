import { Text } from '@experiments/components';
import { memo } from 'react';

type TProps = {
  question: string;
};

const PollQuestion: React.FC<TProps> = ({ question }) => {
  return (
    <Text color="on-secondary" type="heading-secondary">
      {question}
    </Text>
  );
};

export default memo(PollQuestion);
