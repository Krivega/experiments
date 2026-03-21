const getSubstringInsideSquareBrackets = (value: string): string | undefined => {
  const substringInsideBrackets = /\[([^\]]+?)]/m.exec(value);

  if (substringInsideBrackets) {
    return substringInsideBrackets[1];
  }

  return undefined;
};

export default getSubstringInsideSquareBrackets;
