/// <reference types="jest" />
import { toLocaleDateString } from '..';

const expectedDate = '19.11.2019, 16:13';

describe('toLocaleDateString', () => {
  it('from date', () => {
    const date = new Date(2019, 10, 19, 16, 13, 0);
    const localeDateString = toLocaleDateString(date, 'ru');

    expect(localeDateString).toBe(expectedDate);
  });

  it('from string date', () => {
    const dateString = '19.11.2019, 16:13';
    const localeDateString = toLocaleDateString(dateString, 'ru');

    expect(localeDateString).toBe(expectedDate);
  });

  it('from number timeStamp', () => {
    const timeStamp = 1_574_169_191_000;
    const localeDateString = toLocaleDateString(timeStamp, 'ru');

    expect(localeDateString).toBe(expectedDate);
  });

  it('from string timeStamp', () => {
    const timeStamp = '1574169191000';
    const localeDateString = toLocaleDateString(timeStamp, 'ru');

    expect(localeDateString).toBe(expectedDate);
  });

  it('from invalid dateString', () => {
    const dateString = '20:20:41';
    const localeDateString = toLocaleDateString(dateString, 'ru');

    expect(localeDateString).toBe(dateString);
  });
});
