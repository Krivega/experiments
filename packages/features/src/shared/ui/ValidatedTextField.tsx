import { Field } from '@experiments/components';
import { observer } from 'mobx-react';

type TProps<TError = unknown> = {
  getValue: () => string;
  onChange: (value: string) => void;
  getError: () => TError | undefined;
  hasValid: () => boolean;
  getFieldErrorText: (error: TError) => string;
  button?: React.ReactNode;
  testid: string;
  label: string;
  isRequired?: boolean;
  maxLength?: number;
};

const ValidatedTextField = <TError,>({
  getValue,
  onChange,
  getError,
  hasValid,
  getFieldErrorText,
  testid,
  label,
  isRequired,
  maxLength,
  button,
}: TProps<TError>) => {
  const error = getError();

  return (
    <Field
      showErrorsOnlyAfterBlur
      withoutLine
      button={button}
      helperText={error === undefined ? undefined : getFieldErrorText(error)}
      invalid={!hasValid()}
      label={label}
      maxLength={maxLength}
      persistentHelperText={!hasValid()}
      required={isRequired}
      testid={testid}
      type="text"
      validationMsgHelperText={!hasValid()}
      value={getValue()}
      onChange={onChange}
    />
  );
};

export default observer(ValidatedTextField);
