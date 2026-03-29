/// <reference types="jest" />
import removeNonDigits from '../removeNonDigits';

describe('removeNonDigits', () => {
  it('возвращает undefined для undefined', () => {
    expect(removeNonDigits(undefined)).toBeUndefined();
  });

  it('оставляет только цифры', () => {
    expect(removeNonDigits('123')).toBe('123');
    expect(removeNonDigits('12345')).toBe('12345');
    expect(removeNonDigits('0')).toBe('0');
  });

  it('удаляет буквы', () => {
    expect(removeNonDigits('12a34')).toBe('1234');
    expect(removeNonDigits('abc123def')).toBe('123');
    expect(removeNonDigits('a1b2c3')).toBe('123');
  });

  it('удаляет пробелы и спецсимволы', () => {
    expect(removeNonDigits('1 2 3')).toBe('123');
    expect(removeNonDigits('12-34')).toBe('1234');
    expect(removeNonDigits('+7 (999) 123-45-67')).toBe('79991234567');
  });

  it('возвращает пустую строку, если нет цифр', () => {
    expect(removeNonDigits('')).toBe('');
    expect(removeNonDigits('abc')).toBe('');
    expect(removeNonDigits('   ')).toBe('');
  });
});
