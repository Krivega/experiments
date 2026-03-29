/// <reference types="jest" />
/// <reference types="jest-extended" />
import { mergeInitialStates } from '../index';

describe('mergeInitialStates', () => {
  it('should merge multiple initial states into a single object', () => {
    const initialStates = [{ a: 1, b: 2 }, { b: 3, c: 4 }, { d: 5 }];

    const result = mergeInitialStates(initialStates);

    expect(result).toEqual({ a: 1, b: 3, c: 4, d: 5 });
  });

  it('should return an empty object if no initial states are provided', () => {
    const result = mergeInitialStates([]);

    expect(result).toEqual({});
  });

  it('should NOT handle initial states with nested objects', () => {
    const initialStates = [{ a: { b: 1, c: 2 } }, { a: { b: 3, d: 4 } }];

    const result = mergeInitialStates(initialStates);

    expect(result).toEqual({ a: { b: 3, d: 4 } });
  });

  it('should handle initial states with arrays', () => {
    const initialStates = [{ a: [1, 2, 3] }, { a: [4, 5] }];

    const result = mergeInitialStates(initialStates);

    expect(result).toEqual({ a: [4, 5] });
  });
});
