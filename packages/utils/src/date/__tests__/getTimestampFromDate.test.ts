/// <reference types="jest" />
import { msPerSecond } from '../constants';
import getFormattedDate from '../getFormattedDate';
import getTimestampFromDate from '../getTimestampFromDate';

const DATE_OPTIONS = {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
} as const;

const LOCALE = 'ru-RU';

describe('getTimestampFromDate', () => {
  it('преобразует корректную дату в timestamp', () => {
    const raw = '2025-04-16 14:45:19';

    const timestamp = getTimestampFromDate(raw) as unknown as number;

    expect(getFormattedDate(Math.floor(timestamp / msPerSecond), LOCALE, DATE_OPTIONS)).toBe(
      '16.04.2025, 14:45:19',
    );
  });

  it('возвращает undefined при некорректной дате', () => {
    const raw = 'invalid-date';

    const timestamp = getTimestampFromDate(raw);

    expect(timestamp).toBeUndefined();
  });

  it('обрабатывает пустую строку', () => {
    const raw = '';

    const timestamp = getTimestampFromDate(raw);

    expect(timestamp).toBeUndefined();
  });
});
