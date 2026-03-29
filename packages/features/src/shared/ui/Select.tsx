import { IndentationContainer, Select as SelectUI, SelectOption } from '@experiments/components';
import { observer } from 'mobx-react';

type TProps = {
  getValue: () => string;
  onChange: (value: string) => void;
  testid: string;
  label: string;
  options: { id: string; name: string }[];
};

const Select = ({ getValue, onChange, testid, label, options }: TProps) => {
  return (
    <IndentationContainer bottom={false} left={false} right={false}>
      <SelectUI label={label} testid={testid} value={getValue()} onChange={onChange}>
        {options.map(({ id, name }) => {
          return (
            <SelectOption key={id} value={id}>
              {name}
            </SelectOption>
          );
        })}
      </SelectUI>
    </IndentationContainer>
  );
};

export default observer(Select);
