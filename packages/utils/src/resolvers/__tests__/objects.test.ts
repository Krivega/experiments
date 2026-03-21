/// <reference types="jest" />
import { resolveEqualsByProperty, resolveFindById } from '../objects';

describe('objects', () => {
  it('resolveFindById', () => {
    const firstItemId = 'firstItemId';
    const secondItemId = 'secondItemId';
    const nonExistentItemId = 'nonExistentItemId';

    const firstExistentItem = { id: firstItemId };
    const secondExistentItem = { id: secondItemId };

    const list = [firstExistentItem, secondExistentItem];

    const findById = resolveFindById(list);

    const firstFoundItem = findById(firstItemId);
    const secondFoundItem = findById(secondItemId);
    const notFoundItem = findById(nonExistentItemId);

    expect(firstFoundItem).toBe(firstExistentItem);
    expect(secondFoundItem).toBe(secondExistentItem);
    expect(notFoundItem).toBe(undefined);
  });

  it('resolveEqualsByProperty', () => {
    const property = 'property';

    const equalsByProperty = resolveEqualsByProperty<number>(property);

    let firstItem: { property?: number } = { property: 1 };
    let secondItem: { property?: number } = { property: 1 };

    let result = equalsByProperty(firstItem)(secondItem);

    expect(result).toBe(true);

    firstItem = { property: 1 };
    secondItem = { property: 2 };

    result = equalsByProperty(firstItem)(secondItem);

    expect(result).toBe(false);

    firstItem = {};
    secondItem = {};

    result = equalsByProperty(firstItem)(secondItem);

    expect(result).toBe(true);

    result = equalsByProperty()();

    expect(result).toBe(true);

    result = equalsByProperty(firstItem)();

    expect(result).toBe(false);

    result = equalsByProperty()(secondItem);

    expect(result).toBe(false);
  });
});
