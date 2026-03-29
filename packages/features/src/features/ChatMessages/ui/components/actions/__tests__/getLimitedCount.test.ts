import getLimitedCount from '../getLimitedCount';

const ZERO_COUNT = 0;
const NEGATIVE_COUNT = -1;
const LARGE_NEGATIVE_COUNT = -100;

const MIN_DISPLAY_COUNT = 1;
const MID_RANGE_COUNT = 50;
const MAX_DISPLAY_COUNT = 99;

const OVERFLOW_BOUNDARY_COUNT = 100;
const ABOVE_OVERFLOW_BOUNDARY_COUNT = 150;
const VERY_LARGE_COUNT = 1000;

describe('getLimitedCount', () => {
  it('должен возвращать пустую строку для count < 1', () => {
    expect(getLimitedCount(ZERO_COUNT)).toBe('');
    expect(getLimitedCount(NEGATIVE_COUNT)).toBe('');
    expect(getLimitedCount(LARGE_NEGATIVE_COUNT)).toBe('');
  });

  it('должен возвращать count как строку для count от 1 до 99', () => {
    expect(getLimitedCount(MIN_DISPLAY_COUNT)).toBe('1');
    expect(getLimitedCount(MID_RANGE_COUNT)).toBe('50');
    expect(getLimitedCount(MAX_DISPLAY_COUNT)).toBe('99');
  });

  it('должен возвращать "99+" для count > 99', () => {
    expect(getLimitedCount(OVERFLOW_BOUNDARY_COUNT)).toBe('99+');
    expect(getLimitedCount(ABOVE_OVERFLOW_BOUNDARY_COUNT)).toBe('99+');
    expect(getLimitedCount(VERY_LARGE_COUNT)).toBe('99+');
  });
});
