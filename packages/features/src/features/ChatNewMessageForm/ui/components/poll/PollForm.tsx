import { IndentationContainer } from '@experiments/components';
import { observer } from 'mobx-react';

import Header from './Header';
import PollFormSubmitButton from './PollFormSubmitButton';
import PollModeSelector from './PollModeSelector';
import { PollOptionsList } from './PollOptionsList';
import PollQuestionField from './PollQuestionField';

import type { TFields } from '../types';

type TProps = {
  getFields: () => TFields;
  onSubmit: () => void;
};

const PollForm: React.FC<TProps> = observer(({ getFields, onSubmit }) => {
  const fields = getFields();
  const question = fields.getPollQuestion();
  const options = fields.getPollOptions();
  const pollMode = fields.getPollMode();
  const isDisabledSubmitPoll = fields.hasDisabledSubmitPoll();

  return (
    <IndentationContainer bottomSize="small" left={false} right={false} topSize="small">
      <Header />

      <PollQuestionField handleQuestionChange={fields.setPollQuestion} question={question} />

      <PollOptionsList fields={fields} options={options} />

      <PollModeSelector
        isMultiple={pollMode === 'multiple'}
        onSelectMultiple={() => {
          fields.setPollMode('multiple');
        }}
        onSelectSingle={() => {
          fields.setPollMode('single');
        }}
      />

      <PollFormSubmitButton isDisabled={isDisabledSubmitPoll} onSubmit={onSubmit} />
    </IndentationContainer>
  );
});

export default PollForm;
