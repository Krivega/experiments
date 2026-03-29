import { IndentationContainer } from '@experiments/components';
import { useCallback, useState } from 'react';

import { commitPollOption } from './commitPollOption';
import PollOptionAddField from './PollOptionAddField';

import type { TPollFields } from '../../types';

type TProps = {
  fields: TPollFields;
  options: string[];
};

const PollAddOptionsSection: React.FC<TProps> = ({ fields, options }) => {
  const [value, setValue] = useState('');
  const [nextValue, setNextValue] = useState('');

  const onBlurFirst = useCallback(() => {
    commitPollOption({ value, fields, options, setValue });

    if (value.trim() !== '') {
      setValue(nextValue);
      setNextValue('');
    }
  }, [value, nextValue, fields, options]);

  const onBlurSecond = useCallback(() => {
    commitPollOption({
      fields,
      options,
      value: nextValue,
      setValue: setNextValue,
    });
  }, [nextValue, fields, options]);

  const isValue = value.trim() !== '';
  const showNextAddField = isValue && fields.canAddPollOption();

  return (
    <>
      <PollOptionAddField
        testid="pollOptionAdd"
        value={value}
        onBlur={onBlurFirst}
        onChange={setValue}
      />

      {showNextAddField ? (
        <IndentationContainer bottom={false} left={false} right={false} topSize="small">
          <PollOptionAddField
            testid="pollOptionAddNext"
            value={nextValue}
            onBlur={onBlurSecond}
            onChange={setNextValue}
          />
        </IndentationContainer>
      ) : undefined}
    </>
  );
};

export default PollAddOptionsSection;
