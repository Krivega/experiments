/// <reference types="jest" />
import validateIsRequired from '../validateIsRequired';

describe('validateIsRequired', () => {
  it('должен возвращать undefined для текста', () => {
    expect(validateIsRequired('some text')).toBe(undefined);
  });

  it('должен возвращать undefined для пробела', () => {
    expect(validateIsRequired(' ')).toBe(undefined);
  });

  it('должен возвращать "FIELD_IS_REQUIRED" для пустой строки', () => {
    expect(validateIsRequired('')).toBe('FIELD_IS_REQUIRED');
  });

  it('должен возвращать "FIELD_IS_REQUIRED" для undefined', () => {
    expect(validateIsRequired(undefined)).toBe('FIELD_IS_REQUIRED');
  });
});
