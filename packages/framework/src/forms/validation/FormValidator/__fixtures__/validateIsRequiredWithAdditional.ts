const validateIsRequiredWithAdditional = (
  value: string | undefined,
  { isRegisteredUser }: { isRegisteredUser: boolean },
): string | undefined => {
  const isValueDefined = value !== undefined && value !== '';

  if (isRegisteredUser && !isValueDefined) {
    return 'required';
  }

  return undefined;
};

export default validateIsRequiredWithAdditional;
