/// <reference types="jest" />
import { isNumericString } from '..';

describe('isNumericString', () => {
  it('should return false if value is not string', () => {
    expect(isNumericString(5)).toBe(false);
  });

  it('should return false if value can not be converted to number', () => {
    expect(isNumericString('abc')).toBe(false);
  });

  it('should return true if value can be converted to number', () => {
    expect(isNumericString('222')).toBe(true);
  });

  it('should return false if value contains number and none number characters', () => {
    expect(isNumericString('999998<img%20src=“Random.gif”%20onerror=alert(document.domain)>')).toBe(
      false,
    );
  });

  it('should return true if string contains just a negative sign', () => {
    expect(isNumericString('-')).toBe(false);
  });

  it('should return true if string contains digits with leading zeroes', () => {
    expect(isNumericString('00456')).toBe(true);
  });
});
