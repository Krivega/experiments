/// <reference types="jest" />
import stringArrayToCollectionMap from '../index';

describe('stringArrayToCollectionMap', () => {
  it('should return an empty array when given an empty array', () => {
    const result = stringArrayToCollectionMap([]);

    expect(result).toEqual([]);
  });

  it('should return an array of objects with id properties matching the input strings', () => {
    const input = ['a', 'b', 'c'];
    const expectedOutput = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const result = stringArrayToCollectionMap(input);

    expect(result).toEqual(expectedOutput);
  });
});
