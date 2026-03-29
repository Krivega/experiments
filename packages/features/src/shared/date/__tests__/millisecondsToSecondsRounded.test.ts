/// <reference types="jest" />
import millisecondsToSecondsRounded from '../millisecondsToSecondsRounded';

const MILLISECONDS_IN_SECOND = 1000;
const ROUNDING_THRESHOLD_MILLISECONDS = 500;

describe('millisecondsToSecondsRounded', () => {
  it('должен возвращать 0 для 0 миллисекунд', () => {
    expect(millisecondsToSecondsRounded(0)).toBe(0);
  });

  it('должен возвращать 1 для ровно 1000 миллисекунд', () => {
    expect(millisecondsToSecondsRounded(MILLISECONDS_IN_SECOND)).toBe(1);
  });

  it('должен округлять вверх при значении от 500 мс и выше', () => {
    expect(
      millisecondsToSecondsRounded(MILLISECONDS_IN_SECOND + ROUNDING_THRESHOLD_MILLISECONDS),
    ).toBe(2);
    expect(
      millisecondsToSecondsRounded(
        MILLISECONDS_IN_SECOND + MILLISECONDS_IN_SECOND + ROUNDING_THRESHOLD_MILLISECONDS,
      ),
    ).toBe(3);
    expect(millisecondsToSecondsRounded(2800)).toBe(3);
  });

  it('должен округлять вниз при значении менее 500 мс', () => {
    expect(
      millisecondsToSecondsRounded(MILLISECONDS_IN_SECOND + ROUNDING_THRESHOLD_MILLISECONDS - 1),
    ).toBe(1);
    expect(millisecondsToSecondsRounded(ROUNDING_THRESHOLD_MILLISECONDS - 1)).toBe(0);
  });

  it('не должен возвращать дробное число', () => {
    expect(Number.isInteger(millisecondsToSecondsRounded(1234))).toBe(true);
    expect(Number.isInteger(millisecondsToSecondsRounded(999))).toBe(true);
  });
});
