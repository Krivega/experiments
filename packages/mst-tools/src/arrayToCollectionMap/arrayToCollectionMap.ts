const arrayToCollectionMap = <T extends Record<string, unknown>>(
  array: T[],
  {
    fieldName = 'id',
    parser = (item: T) => {
      return item;
    },
  }: {
    fieldName?: string;
    parser?: (item: T) => T;
  } = {},
): Record<string, T> => {
  return array.reduce<Record<string, T>>((accumulator, item) => {
    return { ...accumulator, [String(item[fieldName])]: parser(item) };
  }, {});
};

export default arrayToCollectionMap;
