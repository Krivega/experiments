/// <reference types="jest" />
import resolveValidateMaxLengthIfValue from '../resolveValidateMaxLengthIfValue';

describe('resolveValidateMaxLengthIfValue', () => {
  const validator = resolveValidateMaxLengthIfValue({
    maxLength: 5,
    errorText: 'TOO_LONG',
  });

  it('должен возвращать undefined для пустой строки', () => {
    expect(validator('')).toBe(undefined);
  });

  it('должен возвращать undefined для undefined', () => {
    expect(validator(undefined)).toBe(undefined);
  });

  it('должен возвращать undefined когда длина не превышает maxLength', () => {
    expect(validator('12345')).toBe(undefined);
    expect(validator('abc')).toBe(undefined);
  });

  it('должен возвращать errorText когда длина превышает maxLength', () => {
    expect(validator('123456')).toBe('TOO_LONG');
    expect(validator('abcdef')).toBe('TOO_LONG');
  });
});
