import type { TArrayValue } from './types';

const hasNullOrUndefined = (value: unknown): value is null | undefined => {
  return value === undefined || value === null;
};

const hasNotEqualLength = (prev: unknown[], next: unknown[]): boolean => {
  return prev.length !== next.length;
};

const hasMatchedArrays = (prevValue: TArrayValue, nextValue: TArrayValue): boolean => {
  if (hasNullOrUndefined(prevValue) || hasNullOrUndefined(nextValue)) {
    return prevValue === nextValue;
  }

  if (hasNotEqualLength(prevValue, nextValue)) {
    return false;
  }

  const nextSet = new Set(nextValue);

  return prevValue.every((item) => {
    return nextSet.has(item);
  });
};

export default hasMatchedArrays;
