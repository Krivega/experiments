/// <reference types="jest" />
import { parseSecondsToMilliseconds } from '..';
import { msPerSecond } from '../constants';

describe('parseSecondsToMilliseconds', () => {
  it('should return undefined when input is undefined', () => {
    expect(parseSecondsToMilliseconds(undefined)).toBeUndefined();
  });

  it('should convert seconds to milliseconds', () => {
    const seconds = 5;
    const expectedMilliseconds = 5 * msPerSecond;

    expect(parseSecondsToMilliseconds(seconds)).toBe(expectedMilliseconds);
  });

  it('should handle zero correctly', () => {
    expect(parseSecondsToMilliseconds(0)).toBe(0);
  });

  it('should handle negative numbers', () => {
    const negativeSeconds = -3;
    const expectedMilliseconds = -3 * msPerSecond;

    expect(parseSecondsToMilliseconds(negativeSeconds)).toBe(expectedMilliseconds);
  });

  it('should handle decimal numbers', () => {
    const decimalSeconds = 2.5;
    const expectedMilliseconds = 2.5 * msPerSecond;

    expect(parseSecondsToMilliseconds(decimalSeconds)).toBe(expectedMilliseconds);
  });

  it('should return correct value for very large numbers', () => {
    const largeNumber = Number.MAX_SAFE_INTEGER;
    const expectedMilliseconds = Number.MAX_SAFE_INTEGER * msPerSecond;

    expect(parseSecondsToMilliseconds(largeNumber)).toBe(expectedMilliseconds);
  });
});
