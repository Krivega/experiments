/// <reference types="jest" />
import { getFormattedDate } from '..';

describe('getFormattedDate', () => {
  const options = {
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const,
  };

  it('should format the last connected date correctly', () => {
    const timestampInSeconds = 1_634_567_890;
    const locale = 'en-US';

    const result = getFormattedDate(timestampInSeconds, locale, options);

    expect(result).toEqual('October 18, 2021');
  });

  it('should format the last connected date correctly with different locale and options', () => {
    const timestampInSeconds = 1_634_567_890;
    const locale = 'ru-Ru';

    const result = getFormattedDate(timestampInSeconds, locale, options);

    expect(result).toEqual('18 октября 2021 г.');
  });
});
