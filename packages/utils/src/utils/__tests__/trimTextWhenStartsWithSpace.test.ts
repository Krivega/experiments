/// <reference types="jest" />
import { trimTextWhenStartsWithSpace } from '..';

const value = 'value';

describe('trimTextWhenStartsWithSpace', () => {
  it('work for value with started space', () => {
    expect(trimTextWhenStartsWithSpace(` ${value} `)).toBe(value);
  });

  it('work for value with not started space', () => {
    expect(trimTextWhenStartsWithSpace(`${value} `)).toBe(`${value} `);
  });

  it('work for value without spaces', () => {
    expect(trimTextWhenStartsWithSpace(value)).toBe(value);
  });
});
