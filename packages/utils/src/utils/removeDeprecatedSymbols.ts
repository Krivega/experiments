const removeDeprecatedSymbols = (text: string, deprecatedSymbols: string[]): string => {
  const filteredText = [...text]
    .filter((char) => {
      return !deprecatedSymbols.includes(char);
    })
    .join('');

  return filteredText;
};

export default removeDeprecatedSymbols;
