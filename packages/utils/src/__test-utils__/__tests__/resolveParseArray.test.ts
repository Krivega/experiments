/// <reference types="jest" />
import resolveParseArray from '../resolveParseArray';

type TItem = { id: number; value: string };

describe('resolveParseArray', () => {
  const list: TItem[] = [
    { id: 10, value: 'value10' },
    { id: 1, value: 'value1' },
    { id: 6, value: 'value6' },
    { id: 5, value: 'value5' },
    { id: 111, value: 'value111' },
    { id: 2, value: 'value2' },
    { id: 3, value: 'value3' },
    { id: 4, value: 'value4' },
  ];

  it('should be sorted by parameter', () => {
    const parseArrayById = resolveParseArray<TItem>('id');
    const parsedListById = parseArrayById(list);

    expect(parsedListById).toEqual([
      { id: 1, value: 'value1' },
      { id: 2, value: 'value2' },
      { id: 3, value: 'value3' },
      { id: 4, value: 'value4' },
      { id: 5, value: 'value5' },
      { id: 6, value: 'value6' },
      { id: 10, value: 'value10' },
      { id: 111, value: 'value111' },
    ]);

    const parseArrayByValue = resolveParseArray<TItem>('value');
    const parsedListByValue = parseArrayByValue(list);

    expect(parsedListByValue).toEqual([
      { id: 1, value: 'value1' },
      { id: 10, value: 'value10' },
      { id: 111, value: 'value111' },
      { id: 2, value: 'value2' },
      { id: 3, value: 'value3' },
      { id: 4, value: 'value4' },
      { id: 5, value: 'value5' },
      { id: 6, value: 'value6' },
    ]);
  });
});
