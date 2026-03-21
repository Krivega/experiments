const SPACE = ' ';

const trimTextWhenStartsWithSpace = (value: string): string => {
  if (value.startsWith(SPACE)) {
    return value.trim();
  }

  return value;
};

export default trimTextWhenStartsWithSpace;
