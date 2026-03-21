/// <reference types="jest" />
import splitArray from '../splitArray';

describe('splitArray', () => {
  it('should split array of numbers based on even/odd predicate', () => {
    const numbers = [1, 2, 3, 4, 5, 6];
    const { included, excluded } = splitArray(numbers, (number) => {
      return number % 2 === 0;
    });

    expect(included).toEqual([2, 4, 6]);
    expect(excluded).toEqual([1, 3, 5]);
  });

  it('should split array of strings based on length predicate', () => {
    const strings = ['a', 'ab', 'abc', 'abcd'];
    const { included, excluded } = splitArray(strings, (string) => {
      return string.length > 2;
    });

    expect(included).toEqual(['abc', 'abcd']);
    expect(excluded).toEqual(['a', 'ab']);
  });

  it('should handle empty array', () => {
    const empty: number[] = [];
    const { included, excluded } = splitArray(empty, (number) => {
      return number > 0;
    });

    expect(included).toEqual([]);
    expect(excluded).toEqual([]);
  });

  it('should handle array with all items matching predicate', () => {
    const numbers = [2, 4, 6, 8];
    const { included, excluded } = splitArray(numbers, (number) => {
      return number % 2 === 0;
    });

    expect(included).toEqual([2, 4, 6, 8]);
    expect(excluded).toEqual([]);
  });

  it('should handle array with no items matching predicate', () => {
    const numbers = [1, 3, 5, 7];
    const { included, excluded } = splitArray(numbers, (number) => {
      return number % 2 === 0;
    });

    expect(included).toEqual([]);
    expect(excluded).toEqual([1, 3, 5, 7]);
  });

  it('should work with objects', () => {
    const users = [
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob', age: 30 },
      { id: 3, name: 'Charlie', age: 35 },
    ];
    const { included, excluded } = splitArray(users, (user) => {
      return user.age >= 30;
    });

    expect(included).toEqual([
      { id: 2, name: 'Bob', age: 30 },
      { id: 3, name: 'Charlie', age: 35 },
    ]);
    expect(excluded).toEqual([{ id: 1, name: 'Alice', age: 25 }]);
  });
});
