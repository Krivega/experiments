const validateIsRequired = (value: string | undefined): string | undefined => {
  if (value === undefined || value === '') {
    return 'required';
  }

  return undefined;
};

export default validateIsRequired;
