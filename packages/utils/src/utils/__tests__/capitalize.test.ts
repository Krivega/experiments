/// <reference types="jest" />
import { capitalize } from '..';

const value = 'value';

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize(value)).toBe('Value');
  });

  it('should capitalize first letter if word is with space', () => {
    expect(capitalize(` ${value} `)).toBe('Value');
  });
});
