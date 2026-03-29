/// <reference types="jest" />
import { mapToArray } from '../index';

describe('mapToArray', () => {
  it('should return an empty array when the map is empty', () => {
    const map = new Map<string, number>();
    const result = mapToArray(map);

    expect(result).toEqual([]);
  });

  it('should return an array with the values from the map', () => {
    const map = new Map<string, number>();

    map.set('a', 1);
    map.set('b', 2);
    map.set('c', 3);

    const result = mapToArray(map);

    expect(result).toEqual([1, 2, 3]);
  });

  it('should handle maps with different types of values', () => {
    const map = new Map<string, boolean | number | string>();

    map.set('a', 'hello');
    map.set('b', 42);
    map.set('c', true);

    const result = mapToArray(map);

    expect(result).toEqual(['hello', 42, true]);
  });
});
