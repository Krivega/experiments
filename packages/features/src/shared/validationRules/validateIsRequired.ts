const validateIsRequired = (value: string | undefined): string | undefined => {
  if (value === undefined || value === '') {
    return 'FIELD_IS_REQUIRED';
  }

  return undefined;
};

export default validateIsRequired;
