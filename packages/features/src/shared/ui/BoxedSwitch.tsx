import { FieldBox, IndentationContainer, ToggleSwitch } from '@experiments/components';
import { observer } from 'mobx-react';

type TProps = {
  getValue: () => boolean;
  onChange: (value: boolean) => void;
  testid: string;
  label: string;
};

const BoxedSwitch = ({ getValue, onChange, testid, label }: TProps) => {
  return (
    <IndentationContainer bottomSize="small" left={false} right={false} top={false}>
      <FieldBox>
        <ToggleSwitch checked={getValue()} label={label} testid={testid} onChange={onChange} />
      </FieldBox>
    </IndentationContainer>
  );
};

export default observer(BoxedSwitch);
