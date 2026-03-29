/// <reference types="jest" />
import arrayToCollectionMap from '..';

describe('arrayToCollectionMap', () => {
  it('should map an array to a collection', () => {
    const array = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'Bob' },
    ];

    const result = arrayToCollectionMap(array);

    expect(result).toEqual({
      1: { id: 1, name: 'John' },
      2: { id: 2, name: 'Jane' },
      3: { id: 3, name: 'Bob' },
    });
  });

  it('should use a custom parser function', () => {
    const array = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'Bob' },
    ];

    const parser = (item: (typeof array)[number]) => {
      return { id: item.id, name: item.name.toUpperCase() };
    };

    const result = arrayToCollectionMap(array, { parser });

    expect(result).toEqual({
      1: { id: 1, name: 'JOHN' },
      2: { id: 2, name: 'JANE' },
      3: { id: 3, name: 'BOB' },
    });
  });

  it('should use a custom fieldName', () => {
    const array = [
      { uuid: 1, name: 'John' },
      { uuid: 2, name: 'Jane' },
      { uuid: 3, name: 'Bob' },
    ];

    const result = arrayToCollectionMap(array, { fieldName: 'uuid' });

    expect(result).toEqual({
      1: { uuid: 1, name: 'John' },
      2: { uuid: 2, name: 'Jane' },
      3: { uuid: 3, name: 'Bob' },
    });
  });
});
