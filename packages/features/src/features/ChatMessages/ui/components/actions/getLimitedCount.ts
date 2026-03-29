const COUNT_LIMIT = 99;

const getLimitedCount = (count: number): string => {
  if (count < 1) {
    return '';
  }

  return count > COUNT_LIMIT ? `${COUNT_LIMIT}+` : `${count}`;
};

export default getLimitedCount;
