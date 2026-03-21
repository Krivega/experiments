const splitArray = <T>(sourceItems: T[], predicate: (item: T) => boolean) => {
  const included: T[] = [];
  const excluded: T[] = [];

  sourceItems.forEach((item) => {
    if (predicate(item)) {
      included.push(item);
    } else {
      excluded.push(item);
    }
  });

  return { included, excluded };
};

export default splitArray;
