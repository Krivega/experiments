const removeNonDigits = (value?: string): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  return value.replaceAll(/\D/g, '');
};

export default removeNonDigits;
