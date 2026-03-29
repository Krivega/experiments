/**
 * Доля 100/n при одинаковом числе голосов по всем вариантам.
 * Целые проценты без «.0», иначе одна цифра после запятой (например 33.3% при n = 3).
 */
const formatEqualSplitPercentLabel = (optionCount: number): string => {
  if (optionCount <= 0) {
    return '0%';
  }

  const share = 100 / optionCount;

  if (Number.isInteger(share)) {
    return `${share}%`;
  }

  return `${share.toFixed(1)}%`;
};

export default formatEqualSplitPercentLabel;
