/// <reference types="jest" />
import getFormattedDate from '../getFormattedDate';
import getTimestampInSecondsFromDate from '../getTimestampInSecondsFromDate';

const DATE_OPTIONS = {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
} as const;

const LOCALE = 'ru-RU';

describe('getTimestampInSecondsFromDate', () => {
  it('преобразует корректную дату в timestamp в секундах', () => {
    const raw = '2025-04-16 14:45:19';

    const timestamp = getTimestampInSecondsFromDate(raw) as unknown as number;

    expect(getFormattedDate(timestamp, LOCALE, DATE_OPTIONS)).toBe('16.04.2025, 14:45:19');
  });

  it('возвращает undefined при некорректной дате', () => {
    const raw = 'invalid-date';

    const timestamp = getTimestampInSecondsFromDate(raw);

    expect(timestamp).toBeUndefined();
  });

  it('обрабатывает пустую строку', () => {
    const raw = '';

    const timestamp = getTimestampInSecondsFromDate(raw);

    expect(timestamp).toBeUndefined();
  });
});
