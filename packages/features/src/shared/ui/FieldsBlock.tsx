import { Action, Actions } from '@experiments/components';

type TProps = {
  leftField: React.ReactNode;
  rightField: React.ReactNode;
};

const FieldsBlock = ({ leftField, rightField }: TProps) => {
  return (
    <Actions>
      <Action>{leftField}</Action>

      {rightField}
    </Actions>
  );
};

export default FieldsBlock;
