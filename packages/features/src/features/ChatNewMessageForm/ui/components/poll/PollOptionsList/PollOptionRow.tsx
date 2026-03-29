import { FilterFieldBase, IconButton, IndentationContainer } from '@experiments/components';

import { formatMessage, messagesDescriptors } from '@/shared/translations';
import testIds from '../../testIds';

type TProps = {
  index: number;
  value: string;
  isRemovable: boolean;
  onValueChange: (value: string) => void;
  onRemove: () => void;
};

const PollOptionRow: React.FC<TProps> = ({
  index,
  value,
  isRemovable,
  onValueChange,
  onRemove,
}) => {
  return (
    <IndentationContainer bottomSize="small" left={false} right={false} top={false}>
      <FilterFieldBase
        placeholder={formatMessage(messagesDescriptors.pollOptionPlaceholder, {
          index: index + 1,
        })}
        rightSlot={isRemovable ? <IconButton icon="delete" onClick={onRemove} /> : undefined}
        showRightSlot={isRemovable}
        testid={testIds.pollOptionInput}
        value={value}
        onChange={onValueChange}
      />
    </IndentationContainer>
  );
};

export default PollOptionRow;
