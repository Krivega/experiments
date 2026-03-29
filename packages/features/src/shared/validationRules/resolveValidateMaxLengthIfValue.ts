import resolveValidateIfValueWithParameters from './resolveValidateIfValueWithParameters';

const hasGreaterThenMaxLength = (value: string, maxLength: number): boolean => {
  return value.length > maxLength;
};

const validateMaxLength = (
  value: string,
  { maxLength, errorText }: { maxLength: number; errorText: string },
): string | undefined => {
  if (hasGreaterThenMaxLength(value, maxLength)) {
    return errorText;
  }

  return undefined;
};

const resolveValidateMaxLengthIfValue = ({
  maxLength,
  errorText,
}: {
  maxLength: number;
  errorText: string;
}): ((value?: string) => string | undefined) => {
  return resolveValidateIfValueWithParameters(validateMaxLength, { maxLength, errorText });
};

export default resolveValidateMaxLengthIfValue;
