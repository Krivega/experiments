/// <reference types="jest" />
import { types } from 'mobx-state-tree';

import { createFormField } from '..';

const prepareSetValue = jest.fn((argument?: string) => {
  return argument?.toUpperCase();
});

describe('createFormField', () => {
  const ModelFormField = createFormField(types.string, {
    initialValue: '',
    prepareSetValue,
  });

  // Добавляем модель для тестирования map
  const SelectedDeviceModel = types.model('SelectedDeviceModel', {
    id: types.string,
    name: types.string,
  });

  const MapFormField = createFormField(types.map(SelectedDeviceModel), {
    initialValue: {},
  });

  let formField: ReturnType<typeof ModelFormField.create>;
  let mapFormField: ReturnType<typeof MapFormField.create>;

  beforeEach(() => {
    formField = ModelFormField.create();
    mapFormField = MapFormField.create();
  });

  it('должен создать модель поля формы с базовыми свойствами и методами', () => {
    expect(formField.value).toBe('');
    expect(formField.error).toBe(undefined);
    expect(formField.isClientError).toBe(false);
    expect(formField.isServerError).toBe(false);
    expect(formField.disabled).toBe(false);
    expect(formField.getField()).toHaveProperty('getValue');
    expect(formField.getField()).toHaveProperty('getError');
    expect(formField.getField()).toHaveProperty('hasValid');
    expect(formField.getField()).toHaveProperty('setValue');
    expect(formField.getField()).toHaveProperty('hasDisabled');
  });

  it('должен корректно получать значение поля через getField.getValue()', () => {
    formField.setValue('new value');

    expect(formField.value).toBe('NEW VALUE');
    expect(formField.getField().getValue()).toBe('NEW VALUE');
  });

  it('должен корректно получать ошибку поля через getField.getError()', () => {
    formField.setClientError('new error');

    expect(formField.error?.value).toBe('new error');
    expect(formField.getField().getError()).toBe('new error');
  });

  it('должен корректно устанавливать значение поля через getField.setValue()', () => {
    formField.getField().setValue('new value');

    expect(formField.value).toBe('NEW VALUE');
    expect(formField.getField().getValue()).toBe('NEW VALUE');
  });

  it('должен корректно проверять валидность поля через getField.hasValid()', () => {
    expect(formField.isClientError).toBe(false);
    expect(formField.isServerError).toBe(false);
    expect(formField.getField().hasValid()).toBe(true);

    formField.setClientError('new error');

    expect(formField.isClientError).toBe(true);
    expect(formField.isServerError).toBe(false);
    expect(formField.getField().hasValid()).toBe(false);

    formField.resetError();

    expect(formField.isClientError).toBe(false);
    expect(formField.isServerError).toBe(false);
    expect(formField.getField().hasValid()).toBe(true);

    formField.setServerError('new error');

    expect(formField.isClientError).toBe(false);
    expect(formField.isServerError).toBe(true);
    expect(formField.getField().hasValid()).toBe(false);

    formField.resetError();

    expect(formField.isClientError).toBe(false);
    expect(formField.isServerError).toBe(false);
    expect(formField.getField().hasValid()).toBe(true);
  });

  it('должен сохранять ссылку на getField после обновления значения поля', async () => {
    const speedCopy = formField.getField();

    speedCopy.setValue('new value');

    expect(formField.getField()).toBe(speedCopy);
  });

  it('должен корректно устанавливать значение поля через setValue без prepareSetValue', () => {
    formField = createFormField(types.string, { initialValue: '' }).create();

    formField.setValue('new value');

    expect(formField.value).toBe('new value');
  });

  it('должен корректно устанавливать значение поля через setValue с prepareSetValue', () => {
    formField.setValue('new value');

    expect(formField.value).toBe('NEW VALUE');

    expect(prepareSetValue).toHaveBeenCalledTimes(1);
    expect(prepareSetValue).toHaveBeenCalledWith('new value');
  });

  it('должен корректно устанавливать клиентскую ошибку через setClientError', () => {
    formField.setClientError('new error');

    expect(formField.error).toEqual({ value: 'new error', type: 'client' });
    expect(formField.isClientError).toBe(true);
    expect(formField.isServerError).toBe(false);
  });

  it('должен корректно устанавливать серверную ошибку через setServerError', () => {
    formField.setServerError('new error');

    expect(formField.error).toEqual({ value: 'new error', type: 'server' });
    expect(formField.isClientError).toBe(false);
    expect(formField.isServerError).toBe(true);
  });

  it('должен корректно сбрасывать клиентскую ошибку через resetError', () => {
    formField.setClientError('new error');
    formField.resetError();

    expect(formField.error).toBeUndefined();
    expect(formField.isClientError).toBe(false);
    expect(formField.isServerError).toBe(false);
  });

  it('должен корректно сбрасывать серверную ошибку через resetError', () => {
    formField.setServerError('new error');
    formField.resetError();

    expect(formField.error).toBeUndefined();
    expect(formField.isClientError).toBe(false);
    expect(formField.isServerError).toBe(false);
  });

  describe('работа с типом map', () => {
    it('должен корректно создавать и работать с полем формы типа map', () => {
      // Проверяем начальное состояние
      expect(mapFormField.value.size).toBe(0);
      expect(mapFormField.getField().getValue().size).toBe(0);

      // Добавляем элементы в коллекцию
      const device1 = { id: '1', name: 'Device 1' };
      const device2 = { id: '2', name: 'Device 2' };

      mapFormField.setValue({
        1: device1,
        2: device2,
      });

      // Проверяем, что элементы добавлены
      expect(mapFormField.value.size).toBe(2);
      expect(mapFormField.value.get('1')).toEqual(device1);
      expect(mapFormField.value.get('2')).toEqual(device2);

      // Проверяем через getField
      const fieldValue = mapFormField.getField().getValue();

      expect(fieldValue.size).toBe(2);
      expect(fieldValue.get('1')).toEqual(device1);
      expect(fieldValue.get('2')).toEqual(device2);

      // Проверяем валидность
      expect(mapFormField.getField().hasValid()).toBe(true);

      // Устанавливаем ошибку
      mapFormField.setClientError('Ошибка в коллекции устройств');
      expect(mapFormField.getField().hasValid()).toBe(false);
      expect(mapFormField.getField().getError()).toBe('Ошибка в коллекции устройств');

      // Сбрасываем ошибку
      mapFormField.resetError();
      expect(mapFormField.getField().hasValid()).toBe(true);
    });

    it('должен корректно обрабатывать пустую коллекцию', () => {
      // Проверяем начальное состояние
      expect(mapFormField.value.size).toBe(0);
      expect(mapFormField.getField().getValue().size).toBe(0);

      // Устанавливаем пустую коллекцию
      mapFormField.setValue({});
      expect(mapFormField.value.size).toBe(0);
      expect(mapFormField.getField().getValue().size).toBe(0);
      expect(mapFormField.getField().hasValid()).toBe(true);
    });

    it('должен корректно создавать поле формы с предзаполненными значениями', () => {
      // Создаем предзаполненные данные
      const initialDevices = {
        1: { id: '1', name: 'Device 1' },
        2: { id: '2', name: 'Device 2' },
        3: { id: '3', name: 'Device 3' },
      };

      // Создаем экземпляр с предзаполненными данными
      const preFilledMapFormField = MapFormField.create({
        value: initialDevices,
      });

      // Проверяем, что данные корректно установлены
      expect(preFilledMapFormField.value.size).toBe(3);
      expect(preFilledMapFormField.value.get('1')).toEqual(initialDevices['1']);
      expect(preFilledMapFormField.value.get('2')).toEqual(initialDevices['2']);
      expect(preFilledMapFormField.value.get('3')).toEqual(initialDevices['3']);

      // Проверяем через getField
      const fieldValue = preFilledMapFormField.getField().getValue();

      expect(fieldValue.size).toBe(3);
      expect(fieldValue.get('1')).toEqual(initialDevices['1']);
      expect(fieldValue.get('2')).toEqual(initialDevices['2']);
      expect(fieldValue.get('3')).toEqual(initialDevices['3']);

      // Проверяем, что можно добавлять новые элементы
      const newDevice = { id: '4', name: 'Device 4' };

      preFilledMapFormField.setValue({
        ...initialDevices,
        4: newDevice,
      });

      expect(preFilledMapFormField.value.size).toBe(4);
      expect(preFilledMapFormField.value.get('4')).toEqual(newDevice);

      // Проверяем, что можно удалять элементы
      const { 3: removed, ...remainingDevices } = initialDevices;

      preFilledMapFormField.setValue(remainingDevices);

      expect(preFilledMapFormField.value.size).toBe(2);
      expect(preFilledMapFormField.value.get('3')).toBeUndefined();
      expect(preFilledMapFormField.value.get('1')).toEqual(initialDevices['1']);
      expect(preFilledMapFormField.value.get('2')).toEqual(initialDevices['2']);
    });
  });

  describe('управление состоянием disabled', () => {
    it('должен корректно управлять состоянием disabled', () => {
      // Проверяем начальное состояние
      expect(formField.disabled).toBe(false);
      expect(formField.getField().hasDisabled()).toBe(false);

      // Отключаем поле
      formField.disable();
      expect(formField.disabled).toBe(true);
      expect(formField.getField().hasDisabled()).toBe(true);

      // Включаем поле
      formField.enable();
      expect(formField.disabled).toBe(false);
      expect(formField.getField().hasDisabled()).toBe(false);
    });

    it('должен сохранять состояние disabled при изменении значения', () => {
      formField.disable();
      expect(formField.disabled).toBe(true);

      formField.setValue('new value');
      expect(formField.value).toBe('NEW VALUE');
      expect(formField.disabled).toBe(true);
      expect(formField.getField().hasDisabled()).toBe(true);
    });

    it('должен сохранять состояние disabled при установке ошибок', () => {
      formField.disable();
      expect(formField.disabled).toBe(true);

      formField.setClientError('error');
      expect(formField.error?.value).toBe('error');
      expect(formField.disabled).toBe(true);
      expect(formField.getField().hasDisabled()).toBe(true);

      formField.resetError();
      expect(formField.error).toBeUndefined();
      expect(formField.disabled).toBe(true);
      expect(formField.getField().hasDisabled()).toBe(true);
    });
  });
});
