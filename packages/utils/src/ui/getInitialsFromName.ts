const getInitialsFromName = (name: string): string => {
  const filteredName = name
    .replaceAll(/[^\p{L}\d+\s]/giu, ' ') // Filters alphanumeric symbols
    .replaceAll(/\s+/g, ' '); // Removes excessive whitespace (if exists)

  if (!filteredName.includes(' ')) {
    return [...filteredName].slice(0, 2).join('').toUpperCase();
  }

  return filteredName
    .split(' ')
    .map((string) => {
      return string.charAt(0);
    })
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export default getInitialsFromName;
