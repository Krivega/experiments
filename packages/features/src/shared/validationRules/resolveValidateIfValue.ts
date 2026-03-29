const resolveValidateIfValue = (validate: (value: string) => string | undefined) => {
  return (value?: string) => {
    if (value !== undefined && value !== '') {
      return validate(value);
    }

    return undefined;
  };
};

export default resolveValidateIfValue;
