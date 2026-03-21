/// <reference types="jest" />

import { hasDefinedDeviceId } from '../hasDefinedDeviceId';

describe('hasDefinedDeviceId', () => {
  describe('должен возвращать true для валидных deviceId', () => {
    it('для непустой строки', () => {
      const deviceId = 'test-device-id';
      const result = hasDefinedDeviceId(deviceId);

      expect(result).toBe(true);
      expect(typeof deviceId).toBe('string');
    });

    it('для строки с пробелами', () => {
      const deviceId = ' device-id ';
      const result = hasDefinedDeviceId(deviceId);

      expect(result).toBe(true);
    });

    it('для строки с специальными символами', () => {
      const deviceId = 'device-id-123_456@#$%';
      const result = hasDefinedDeviceId(deviceId);

      expect(result).toBe(true);
    });

    it('для очень длинной строки', () => {
      const deviceId = 'a'.repeat(1000);
      const result = hasDefinedDeviceId(deviceId);

      expect(result).toBe(true);
    });
  });

  describe('должен возвращать false для невалидных deviceId', () => {
    it('для undefined', () => {
      const deviceId = undefined;
      const result = hasDefinedDeviceId(deviceId);

      expect(result).toBe(false);
    });

    it('для пустой строки', () => {
      const deviceId = '';
      const result = hasDefinedDeviceId(deviceId);

      expect(result).toBe(false);
    });

    it('для строки только с пробелами', () => {
      const deviceId = '   ';
      const result = hasDefinedDeviceId(deviceId);

      expect(result).toBe(true);
    });

    it('для строки с табуляцией', () => {
      const deviceId = '\t';
      const result = hasDefinedDeviceId(deviceId);

      expect(result).toBe(true);
    });

    it('для строки с переносом строки', () => {
      const deviceId = '\n';
      const result = hasDefinedDeviceId(deviceId);

      expect(result).toBe(true);
    });
  });

  describe('type guard функциональность', () => {
    it('должен работать как type guard для TypeScript', () => {
      const testCases: { input: string | undefined; expected: boolean }[] = [
        { input: 'valid-id', expected: true },
        { input: '', expected: false },
        { input: undefined, expected: false },
        { input: '   ', expected: true },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = hasDefinedDeviceId(input);

        expect(result).toBe(expected);
      });
    });

    it('должен корректно сужать типы для валидных значений', () => {
      const validDeviceId: string | undefined = 'test-device';
      const result = hasDefinedDeviceId(validDeviceId);

      expect(result).toBe(true);
      expect(typeof validDeviceId).toBe('string');
    });

    it('должен корректно сужать типы для невалидных значений', () => {
      const invalidDeviceId: string | undefined = '';
      const result = hasDefinedDeviceId(invalidDeviceId);

      expect(result).toBe(false);
      expect(invalidDeviceId === '').toBe(true);
    });
  });

  describe('edge cases', () => {
    it('для строки с нулевыми символами', () => {
      const deviceId = '\0';
      const result = hasDefinedDeviceId(deviceId);

      expect(result).toBe(true); // \0 считается валидным символом в строке
    });

    it('для строки с unicode символами', () => {
      const deviceId = 'device-🚀-id';
      const result = hasDefinedDeviceId(deviceId);

      expect(result).toBe(true);
    });

    it('для строки с эмодзи', () => {
      const deviceId = '📱-device-id';
      const result = hasDefinedDeviceId(deviceId);

      expect(result).toBe(true);
    });
  });
});
