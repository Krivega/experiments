const capitalize = (word: string): string => {
  const normalizedWord = word.trim();

  return normalizedWord.charAt(0).toUpperCase() + normalizedWord.slice(1);
};

export default capitalize;
