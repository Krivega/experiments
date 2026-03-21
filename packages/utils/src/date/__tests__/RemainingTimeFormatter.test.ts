/// <reference types="jest" />
import { msPerDay, msPerHour, msPerMinute, msPerMonth, msPerSecond } from '../constants';
import RemainingTimeFormatter from '../remainingTimeFormatter/RemainingTimeFormatter';

describe('RemainingTimeFormatter', () => {
  let formatter: RemainingTimeFormatter;
  const locale = 'en';

  beforeEach(() => {
    formatter = new RemainingTimeFormatter(locale);
  });

  it('should format seconds correctly', () => {
    const fiveSeconds = msPerSecond * 5;
    const formatted = formatter.formatSeconds(fiveSeconds);

    expect(formatted).toBe('5s');
  });

  it('should format minutes correctly', () => {
    const fiveMinutes = msPerMinute * 5;
    const formatted = formatter.formatMinutes(fiveMinutes);

    expect(formatted).toBe('5m');
  });

  it('should format hours and minutes correctly', () => {
    const oneHourFiveMinutes = msPerHour + msPerMinute * 5;
    const formatted = formatter.formatHoursAndMinutes(oneHourFiveMinutes);

    expect(formatted).toBe('1h, 5m');
  });

  it('should format days and hours correctly', () => {
    const twoDaysFiveHours = msPerDay * 2 + msPerHour * 5;
    const formatted = formatter.formatDaysAndHours(twoDaysFiveHours);

    expect(formatted).toBe('2d, 5h');
  });

  it('should format months, days, and hours correctly', () => {
    const oneMonthTwoDaysFiveHours = msPerMonth + msPerDay * 2 + msPerHour * 5;
    const formatted = formatter.formatMonthsDaysAndHours(oneMonthTwoDaysFiveHours);

    expect(formatted).toBe('1m, 2d, 5h');
  });
});
