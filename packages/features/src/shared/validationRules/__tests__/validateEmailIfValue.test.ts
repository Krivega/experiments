/// <reference types="jest" />
import validateEmailIfValue from '../validateEmailIfValue';

const VALID = undefined;
const INVALID = 'EMAIL_IS_NOT_VALID';

const MAX_LOCAL_PART_LENGTH = 64;
const MAX_EMAIL_LENGTH = 254;

describe('validateEmailIfValue', () => {
  describe('необязательное поле', () => {
    it('возвращает undefined для undefined', () => {
      expect(validateEmailIfValue(undefined)).toBe(VALID);
    });

    it('возвращает undefined для пустой строки', () => {
      expect(validateEmailIfValue('')).toBe(VALID);
    });
  });

  describe('невалидный формат', () => {
    it('возвращает ошибку при отсутствии @', () => {
      expect(validateEmailIfValue('invalid')).toBe(INVALID);
    });

    it('возвращает ошибку при @ в начале (пустая local-part)', () => {
      expect(validateEmailIfValue('@domain.com')).toBe(INVALID);
    });

    it('возвращает ошибку при @ в конце (пустой domain)', () => {
      expect(validateEmailIfValue('user@')).toBe(INVALID);
    });

    it('возвращает ошибку при отсутствии TLD (нет точки в domain)', () => {
      expect(validateEmailIfValue('user@domain')).toBe(INVALID);
    });

    it('возвращает ошибку при TLD короче 2 символов', () => {
      expect(validateEmailIfValue('user@domain.c')).toBe(INVALID);
    });

    it('возвращает ошибку при нескольких @', () => {
      expect(validateEmailIfValue('user@x@domain.com')).toBe(INVALID);
    });

    it('возвращает ошибку при недопустимых символах (пробел)', () => {
      expect(validateEmailIfValue('user name@domain.com')).toBe(INVALID);
    });
  });

  describe('валидный формат', () => {
    it('принимает простой адрес', () => {
      expect(validateEmailIfValue('user@example.com')).toBe(VALID);
    });

    it('принимает local-part с точкой', () => {
      expect(validateEmailIfValue('user.name@domain.org')).toBe(VALID);
    });

    it('принимает local-part с цифрами', () => {
      expect(validateEmailIfValue('user123@example.com')).toBe(VALID);
    });

    it('принимает local-part с плюсом и процентом', () => {
      expect(validateEmailIfValue('user+tag@example.com')).toBe(VALID);
    });

    it('принимает local-part с дефисом', () => {
      expect(validateEmailIfValue('user-name@example.com')).toBe(VALID);
    });

    it('принимает local-part с кириллицей', () => {
      expect(validateEmailIfValue('пользователь@example.com')).toBe(VALID);
    });

    it('принимает адрес с local-part ровно 64 символа', () => {
      const local64 = 'a'.repeat(MAX_LOCAL_PART_LENGTH);

      expect(validateEmailIfValue(`${local64}@x.co`)).toBe(VALID);
    });

    it('принимает адрес длиной ровно 254 символа', () => {
      const local = 'a'.repeat(MAX_LOCAL_PART_LENGTH);
      const domainLength = MAX_EMAIL_LENGTH - MAX_LOCAL_PART_LENGTH - '@'.length - '.co'.length;
      const domain = `${'b'.repeat(domainLength)}.co`;
      const email254 = `${local}@${domain}`;

      expect(email254).toHaveLength(MAX_EMAIL_LENGTH);
      expect(validateEmailIfValue(email254)).toBe(VALID);
    });
  });

  describe('ограничения длины', () => {
    it('возвращает ошибку при длине адреса > 254', () => {
      const longDomain = 'a'.repeat(MAX_EMAIL_LENGTH + 1);

      expect(validateEmailIfValue(`u@${longDomain}.com`)).toBe(INVALID);
    });

    it('возвращает ошибку при длине local-part > 64', () => {
      const longLocal = 'a'.repeat(MAX_LOCAL_PART_LENGTH + 1);

      expect(validateEmailIfValue(`${longLocal}@example.com`)).toBe(INVALID);
    });
  });
});
