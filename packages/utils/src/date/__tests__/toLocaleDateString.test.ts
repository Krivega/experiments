/// <reference types="jest" />
import { toLocaleDateString } from '..';

const ruLocale = 'ru';

const ruDateTimeOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: false,
};

describe('toLocaleDateString', () => {
  it('from date', () => {
    const date = new Date(2019, 10, 19, 16, 13, 0);

    expect(toLocaleDateString(date, ruLocale)).toBe(
      date.toLocaleDateString(ruLocale, ruDateTimeOptions),
    );
  });

  it('from string date', () => {
    const dateString = '19.11.2019, 16:13';

    expect(toLocaleDateString(dateString, ruLocale)).toBe(dateString);
  });

  it('from number timeStamp', () => {
    const timeStamp = 1_574_169_191_000;
    const date = new Date(timeStamp);

    expect(toLocaleDateString(timeStamp, ruLocale)).toBe(
      date.toLocaleDateString(ruLocale, ruDateTimeOptions),
    );
  });

  it('from string timeStamp', () => {
    const timeStamp = '1574169191000';
    const date = new Date(Number(timeStamp));

    expect(toLocaleDateString(timeStamp, ruLocale)).toBe(
      date.toLocaleDateString(ruLocale, ruDateTimeOptions),
    );
  });

  it('from invalid dateString', () => {
    const dateString = '20:20:41';

    expect(toLocaleDateString(dateString, ruLocale)).toBe(dateString);
  });
});
