import { Button, IndentationContainer } from '@experiments/components';

import { formatMessage, messagesDescriptors } from '@/shared/translations';

type TProps = {
  isDisabled: boolean;
  onSubmit: () => void;
};

const PollFormSubmitButton: React.FC<TProps> = ({ isDisabled, onSubmit }) => {
  return (
    <IndentationContainer bottom={false} top={false}>
      <Button
        raised
        rounded
        disabled={isDisabled}
        size="wide"
        testid="pollSubmit"
        onClick={onSubmit}
      >
        {formatMessage(messagesDescriptors.pollSubmit)}
      </Button>
    </IndentationContainer>
  );
};

export default PollFormSubmitButton;
