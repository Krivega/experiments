import { FilterField, IndentationContainer } from '@experiments/components';
import { useCallback } from 'react';

import { formatMessage, messagesDescriptors } from '../../../../../shared/translations';

export type TProps = {
  question: string;
  handleQuestionChange: (value: string) => void;
};

const PollQuestionField: React.FC<TProps> = ({ question, handleQuestionChange }) => {
  const onClear = useCallback(() => {
    handleQuestionChange('');
  }, [handleQuestionChange]);

  return (
    <IndentationContainer bottomSize="small" top={false}>
      <FilterField
        placeholder={formatMessage(messagesDescriptors.pollQuestionPlaceholder)}
        value={question}
        onChange={handleQuestionChange}
        onClickClear={onClear}
      />
    </IndentationContainer>
  );
};

export default PollQuestionField;
