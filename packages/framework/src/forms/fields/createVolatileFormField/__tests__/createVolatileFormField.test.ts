/// <reference types="jest" />
import { getSnapshot, types } from 'mobx-state-tree';

import createVolatileFormField from '../createVolatileFormField';

import type { Instance } from 'mobx-state-tree';

const testFile = new File(['some test file content'], 'testFile.txt', { type: 'text/plain' });
const newTestFile = new File(['new test file content'], 'newTestFile.txt', { type: 'text' });

const prepareSetValue = jest.fn((argument?: File) => {
  return argument;
});

const hasFilesEqual = (file1: File, file2: File) => {
  if (file1.name !== file2.name) {
    return false;
  }

  if (file1.type !== file2.type) {
    return false;
  }

  if (file1.size !== file2.size) {
    return false;
  }

  return true;
};

const Model = types
  .model({
    value: createVolatileFormField({
      initialValue: testFile,
    }),
  })
  .views((self) => {
    return {
      get valueField() {
        return self.value.getField();
      },
    };
  });

describe('createVolatileFormField', () => {
  const ModelFormFieldVolatile = createVolatileFormField({
    initialValue: testFile,
    prepareSetValue,
  });

  let formFieldVolatile: ReturnType<typeof ModelFormFieldVolatile.create>;

  beforeEach(() => {
    formFieldVolatile = ModelFormFieldVolatile.create();
  });

  it('должен создать модель поля формы с базовыми свойствами и методами', () => {
    expect(formFieldVolatile.value).toEqual(testFile);
    expect(formFieldVolatile.value instanceof File).toBe(true);
    expect(formFieldVolatile.error).toBe(undefined);
    expect(formFieldVolatile.isClientError).toBe(false);
    expect(formFieldVolatile.isServerError).toBe(false);
    expect(formFieldVolatile.disabled).toBe(false);
    expect(formFieldVolatile.getField()).toHaveProperty('getValue');
    expect(formFieldVolatile.getField()).toHaveProperty('getError');
    expect(formFieldVolatile.getField()).toHaveProperty('hasValid');
    expect(formFieldVolatile.getField()).toHaveProperty('setValue');
    expect(formFieldVolatile.getField()).toHaveProperty('hasDisabled');
  });

  it('должен получать значение поля через getField.getValue()', () => {
    formFieldVolatile.setValue(newTestFile);

    expect(formFieldVolatile.value).toEqual(newTestFile);
    expect(hasFilesEqual(formFieldVolatile.getField().getValue(), newTestFile)).toBe(true);
  });

  it('должен получать ошибку поля через getField.getError()', () => {
    formFieldVolatile.setClientError('new error');

    expect(formFieldVolatile.error?.value).toBe('new error');
    expect(formFieldVolatile.getField().getError()).toBe('new error');
  });

  it('должен устанавливать значение поля через getField.setValue()', () => {
    formFieldVolatile.getField().setValue(newTestFile);

    expect(formFieldVolatile.value).toEqual(newTestFile);
    expect(hasFilesEqual(formFieldVolatile.getField().getValue(), newTestFile)).toBe(true);
  });

  it('должен проверять валидность поля через getField.hasValid()', () => {
    expect(formFieldVolatile.isClientError).toBe(false);
    expect(formFieldVolatile.isServerError).toBe(false);
    expect(formFieldVolatile.getField().hasValid()).toBe(true);

    formFieldVolatile.setClientError('new error');

    expect(formFieldVolatile.isClientError).toBe(true);
    expect(formFieldVolatile.isServerError).toBe(false);
    expect(formFieldVolatile.getField().hasValid()).toBe(false);

    formFieldVolatile.resetError();

    expect(formFieldVolatile.isClientError).toBe(false);
    expect(formFieldVolatile.isServerError).toBe(false);
    expect(formFieldVolatile.getField().hasValid()).toBe(true);

    formFieldVolatile.setServerError('new error');

    expect(formFieldVolatile.isClientError).toBe(false);
    expect(formFieldVolatile.isServerError).toBe(true);
    expect(formFieldVolatile.getField().hasValid()).toBe(false);

    formFieldVolatile.resetError();

    expect(formFieldVolatile.isClientError).toBe(false);
    expect(formFieldVolatile.isServerError).toBe(false);
    expect(formFieldVolatile.getField().hasValid()).toBe(true);
  });

  it('должен сохранять ссылку на getField после обновления значения поля', async () => {
    const speedCopy = formFieldVolatile.getField();

    speedCopy.setValue(newTestFile);

    expect(formFieldVolatile.getField()).toEqual(speedCopy);
  });

  it('должен устанавливать значение поля через setValue без prepareSetValue', () => {
    formFieldVolatile = createVolatileFormField({ initialValue: testFile }).create();

    formFieldVolatile.setValue(newTestFile);

    expect(hasFilesEqual(formFieldVolatile.value, newTestFile)).toBe(true);
  });

  it('должен устанавливать значение поля через setValue с prepareSetValue', () => {
    formFieldVolatile.setValue(newTestFile);

    expect(hasFilesEqual(formFieldVolatile.value, newTestFile)).toBe(true);

    expect(prepareSetValue).toHaveBeenCalledTimes(1);
    expect(prepareSetValue).toHaveBeenCalledWith(newTestFile);
  });

  it('должен устанавливать клиентскую ошибку через setClientError', () => {
    formFieldVolatile.setClientError('new error');

    expect(formFieldVolatile.error).toEqual({ value: 'new error', type: 'client' });
    expect(formFieldVolatile.isClientError).toBe(true);
    expect(formFieldVolatile.isServerError).toBe(false);
  });

  it('должен устанавливать серверную ошибку через setServerError', () => {
    formFieldVolatile.setServerError('new error');

    expect(formFieldVolatile.error).toEqual({ value: 'new error', type: 'server' });
    expect(formFieldVolatile.isClientError).toBe(false);
    expect(formFieldVolatile.isServerError).toBe(true);
  });

  it('должен сбрасывать клиентскую ошибку через resetError', () => {
    formFieldVolatile.setClientError('new error');
    formFieldVolatile.resetError();

    expect(formFieldVolatile.error).toBeUndefined();
    expect(formFieldVolatile.isClientError).toBe(false);
    expect(formFieldVolatile.isServerError).toBe(false);
  });

  it('должен сбрасывать серверную ошибку через resetError', () => {
    formFieldVolatile.setServerError('new error');
    formFieldVolatile.resetError();

    expect(formFieldVolatile.error).toBeUndefined();
    expect(formFieldVolatile.isClientError).toBe(false);
    expect(formFieldVolatile.isServerError).toBe(false);
  });

  describe('Использование в моделях', () => {
    let instance: ReturnType<typeof Model.create>;

    beforeEach(() => {
      instance = Model.create();
    });

    it('должен возвращать валидный файл при использовании в модели', () => {
      expect(hasFilesEqual(instance.valueField.getValue(), testFile)).toBe(true);
      expect(instance.valueField.getValue() instanceof File).toBe(true);
    });

    it('должен возвращать валидный файл при установке значения в модель', () => {
      instance.valueField.setValue(newTestFile);

      expect(hasFilesEqual(instance.valueField.getValue(), newTestFile)).toBe(true);
      expect(instance.valueField.getValue() instanceof File).toBe(true);
    });
  });

  describe('управление состоянием disabled', () => {
    it('должен управлять состоянием disabled', () => {
      // Проверяем начальное состояние
      expect(formFieldVolatile.disabled).toBe(false);
      expect(formFieldVolatile.getField().hasDisabled()).toBe(false);

      // Отключаем поле
      formFieldVolatile.disable();
      expect(formFieldVolatile.disabled).toBe(true);
      expect(formFieldVolatile.getField().hasDisabled()).toBe(true);

      // Включаем поле
      formFieldVolatile.enable();
      expect(formFieldVolatile.disabled).toBe(false);
      expect(formFieldVolatile.getField().hasDisabled()).toBe(false);
    });

    it('должен сохранять состояние disabled при изменении значения', () => {
      formFieldVolatile.disable();
      expect(formFieldVolatile.disabled).toBe(true);

      formFieldVolatile.setValue(newTestFile);
      expect(hasFilesEqual(formFieldVolatile.value, newTestFile)).toBe(true);
      expect(formFieldVolatile.disabled).toBe(true);
      expect(formFieldVolatile.getField().hasDisabled()).toBe(true);
    });

    it('должен сохранять состояние disabled при установке ошибок', () => {
      formFieldVolatile.disable();
      expect(formFieldVolatile.disabled).toBe(true);

      formFieldVolatile.setClientError('error');
      expect(formFieldVolatile.error?.value).toBe('error');
      expect(formFieldVolatile.disabled).toBe(true);
      expect(formFieldVolatile.getField().hasDisabled()).toBe(true);

      formFieldVolatile.resetError();
      expect(formFieldVolatile.error).toBeUndefined();
      expect(formFieldVolatile.disabled).toBe(true);
      expect(formFieldVolatile.getField().hasDisabled()).toBe(true);
    });
  });

  describe('снапшоты', () => {
    let instance: Instance<typeof Model>;

    beforeEach(() => {
      instance = Model.create();
    });

    it('должен включать в снапшот только сериализуемые поля', () => {
      instance.valueField.setValue(testFile);

      const snapshot = getSnapshot(instance);

      expect(snapshot).toEqual({ value: { error: undefined, disabled: false } });

      // Проверяем, что volatile значение не попало в снапшот
      expect(snapshot.value).not.toHaveProperty('value');
    });

    it('должен восстанавливать volatile значение после создания из снапшота', () => {
      instance.valueField.setValue(testFile);

      const snapshot = getSnapshot(instance);

      const newInstance = Model.create(snapshot);

      // Проверяем, что volatile значение восстановилось к initialValue
      expect(hasFilesEqual(newInstance.valueField.getValue(), testFile)).toBe(true);
    });
  });
});
