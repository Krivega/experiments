/// <reference types="jest" />

import getWeekOfMonth from '../getWeekOfMonth';

const FIRST_WEEK_OF_MONTH = 1;
const SECOND_WEEK_OF_MONTH = 2;
const THIRD_WEEK_OF_MONTH = 3;
const FOURTH_WEEK_OF_MONTH = 4;
const FIFTH_WEEK_OF_MONTH = 5;

describe('getWeekOfMonth', () => {
  it('должен возвращать 1 для первой недели месяца', () => {
    const date = new Date(2024, 0, 1); // 1 января 2024

    expect(getWeekOfMonth(date)).toBe(FIRST_WEEK_OF_MONTH);
  });

  it('должен возвращать 2 для второй недели месяца', () => {
    const date = new Date(2024, 0, 8); // 8 января 2024

    expect(getWeekOfMonth(date)).toBe(SECOND_WEEK_OF_MONTH);
  });

  it('должен возвращать 3 для третьей недели месяца', () => {
    const date = new Date(2024, 0, 15); // 15 января 2024

    expect(getWeekOfMonth(date)).toBe(THIRD_WEEK_OF_MONTH);
  });

  it('должен возвращать 4 для четвертой недели месяца', () => {
    const date = new Date(2024, 0, 22); // 22 января 2024

    expect(getWeekOfMonth(date)).toBe(FOURTH_WEEK_OF_MONTH);
  });

  it('должен возвращать 5 для пятой недели месяца', () => {
    const date = new Date(2024, 0, 29); // 29 января 2024

    expect(getWeekOfMonth(date)).toBe(FIFTH_WEEK_OF_MONTH);
  });
});
