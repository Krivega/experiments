import { CheckboxWithFormField, FieldBox, IndentationContainer } from '@experiments/components';

import { formatMessage, messagesDescriptors } from '../../../../../shared/translations';

export type TProps = {
  isMultiple: boolean;
  onSelectSingle: () => void;
  onSelectMultiple: () => void;
};

const PollModeSelector: React.FC<TProps> = ({ isMultiple, onSelectSingle, onSelectMultiple }) => {
  return (
    <IndentationContainer bottomSize="small" left={false} right={false} top={false}>
      <FieldBox>
        <CheckboxWithFormField
          checked={isMultiple}
          label={formatMessage(messagesDescriptors.pollModeMultiple)}
          size="compact"
          type="reversed"
          onChange={(checked) => {
            if (checked) {
              onSelectMultiple();
            } else {
              onSelectSingle();
            }
          }}
        />
      </FieldBox>
    </IndentationContainer>
  );
};

export default PollModeSelector;
