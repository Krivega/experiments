import { CheckboxWithFormField } from '@experiments/components';
import { observer } from 'mobx-react';

type TProps = {
  getValue: () => boolean;
  onChange: (value: boolean) => void;
  hasDisabled?: () => boolean;
  label: string;
  testid: string;
};

const CheckboxFormField = ({ getValue, onChange, hasDisabled, label, testid }: TProps) => {
  return (
    <CheckboxWithFormField
      checked={getValue()}
      disabled={hasDisabled?.()}
      label={label}
      testid={testid}
      type="reversed"
      onChange={onChange}
    />
  );
};

export default observer(CheckboxFormField);
