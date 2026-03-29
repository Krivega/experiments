const resolveValidateIfValueWithParameters = <T extends Record<string, unknown>>(
  validate: (value: string, additionalArgument: T) => string | undefined,
  additionalArgument: T,
) => {
  return (value?: string) => {
    if (value !== undefined && value !== '') {
      return validate(value, additionalArgument);
    }

    return undefined;
  };
};

export default resolveValidateIfValueWithParameters;
