/// <reference types="jest" />
import { createTimeoutError, hasTimeoutError } from '../errors';

describe('errors', () => {
  describe('createTimeoutError', () => {
    it('должен создавать ошибку с сообщением "Time is ended"', () => {
      const error = createTimeoutError();

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Time is ended');
    });

    it('должен создавать новый экземпляр ошибки при каждом вызове', () => {
      const error1 = createTimeoutError();
      const error2 = createTimeoutError();

      expect(error1).not.toBe(error2);
      expect(error1.message).toBe(error2.message);
    });
  });

  describe('hasTimeoutError', () => {
    it('должен возвращать true для ошибки, созданной через createTimeoutError', () => {
      const error = createTimeoutError();

      expect(hasTimeoutError(error)).toBe(true);
    });

    it('должен возвращать true для ошибки с сообщением "Time is ended"', () => {
      const error = new Error('Time is ended');

      expect(hasTimeoutError(error)).toBe(true);
    });

    it('должен возвращать false для ошибки с другим сообщением', () => {
      const error = new Error('Other error');

      expect(hasTimeoutError(error)).toBe(false);
    });

    it('должен возвращать false для не-ошибки', () => {
      expect(hasTimeoutError('string')).toBe(false);
      expect(hasTimeoutError(123)).toBe(false);
      // eslint-disable-next-line unicorn/no-null
      expect(hasTimeoutError(null)).toBe(false);
      expect(hasTimeoutError(undefined)).toBe(false);
      expect(hasTimeoutError({})).toBe(false);
      expect(hasTimeoutError([])).toBe(false);
    });

    it('должен возвращать false для ошибки без сообщения', () => {
      // eslint-disable-next-line unicorn/error-message
      const error = new Error();

      expect(hasTimeoutError(error)).toBe(false);
    });

    it('должен возвращать false для ошибки с пустым сообщением', () => {
      // eslint-disable-next-line unicorn/error-message
      const error = new Error('');

      expect(hasTimeoutError(error)).toBe(false);
    });
  });
});
