import { FieldBox, IndentationContainer, TitleOverline } from '@experiments/components';

import PollAddOptionsSection from './PollAddOptionsSection';
import PollOptionRow from './PollOptionRow';
import { formatMessage, messagesDescriptors } from '../../../../../../shared/translations';

import type { TPollFields } from '../../types';

type TProps = {
  fields: TPollFields;
  options: string[];
};

const PollOptionsList: React.FC<TProps> = ({ fields, options }) => {
  return (
    <IndentationContainer bottomSize="small" left={false} right={false} top={false}>
      <FieldBox>
        <TitleOverline>{formatMessage(messagesDescriptors.pollOptionsLegend)}</TitleOverline>

        {options.map((opt, index) => {
          return (
            <PollOptionRow
              index={index}
              isRemovable={fields.canRemovePollOption()}
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              value={opt}
              onRemove={() => {
                fields.removePollOption(index);
              }}
              onValueChange={(_value) => {
                fields.setPollOption(index, _value);
              }}
            />
          );
        })}

        {fields.canAddPollOption() ? (
          <PollAddOptionsSection fields={fields} options={options} />
        ) : undefined}
      </FieldBox>
    </IndentationContainer>
  );
};

export default PollOptionsList;
