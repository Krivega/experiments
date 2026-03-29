/// <reference types="jest" />
import { types } from 'mobx-state-tree';

import { createGuardFormField } from '..';

const prepareSetValue = jest.fn((argument?: string) => {
  return argument?.toUpperCase();
});

describe('createGuardFormField', () => {
  const ModelFormField = createGuardFormField(types.string, {
    initialValue: '',
    canSetValue: () => {
      return true;
    },
    prepareSetValue,
  });

  // Добавляем модель для тестирования map
  const SelectedDeviceModel = types.model('SelectedDeviceModel', {
    id: types.string,
    name: types.string,
  });

  const MapFormField = createGuardFormField(types.map(SelectedDeviceModel), {
    initialValue: {},
    canSetValue: () => {
      return true;
    },
  });

  // Модель для тестирования setValueGuarded с условным canSetValue
  const GuardedFormField = createGuardFormField(types.string, {
    initialValue: '',
    canSetValue: (value?: string) => {
      return value !== 'forbidden';
    },
  });

  let formField: ReturnType<typeof ModelFormField.create>;
  let mapFormField: ReturnType<typeof MapFormField.create>;
  let guardedFormField: ReturnType<typeof GuardedFormField.create>;

  beforeEach(() => {
    formField = ModelFormField.create();
    mapFormField = MapFormField.create();
    guardedFormField = GuardedFormField.create();
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

  it('должен получать значение поля через getField.getValue()', () => {
    formField.setValue('new value');

    expect(formField.value).toBe('NEW VALUE');
    expect(formField.getField().getValue()).toBe('NEW VALUE');
  });

  it('должен получать ошибку поля через getField.getError()', () => {
    formField.setClientError('new error');

    expect(formField.error?.value).toBe('new error');
    expect(formField.getField().getError()).toBe('new error');
  });

  it('должен устанавливать значение поля через getField.setValue()', () => {
    formField.getField().setValue('new value');

    expect(formField.value).toBe('NEW VALUE');
    expect(formField.getField().getValue()).toBe('NEW VALUE');
  });

  it('должен проверять валидность поля через getField.hasValid()', () => {
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

  it('должен устанавливать значение поля через setValue без prepareSetValue', () => {
    formField = createGuardFormField(types.string, {
      initialValue: '',
      canSetValue: () => {
        return true;
      },
    }).create();

    formField.setValue('new value');

    expect(formField.value).toBe('new value');
  });

  it('должен устанавливать значение поля через setValue с prepareSetValue', () => {
    formField.setValue('new value');

    expect(formField.value).toBe('NEW VALUE');

    expect(prepareSetValue).toHaveBeenCalledTimes(1);
    expect(prepareSetValue).toHaveBeenCalledWith('new value');
  });

  it('должен устанавливать клиентскую ошибку через setClientError', () => {
    formField.setClientError('new error');

    expect(formField.error).toEqual({ value: 'new error', type: 'client' });
    expect(formField.isClientError).toBe(true);
    expect(formField.isServerError).toBe(false);
  });

  it('должен устанавливать серверную ошибку через setServerError', () => {
    formField.setServerError('new error');

    expect(formField.error).toEqual({ value: 'new error', type: 'server' });
    expect(formField.isClientError).toBe(false);
    expect(formField.isServerError).toBe(true);
  });

  it('должен сбрасывать клиентскую ошибку через resetError', () => {
    formField.setClientError('new error');
    formField.resetError();

    expect(formField.error).toBeUndefined();
    expect(formField.isClientError).toBe(false);
    expect(formField.isServerError).toBe(false);
  });

  it('должен сбрасывать серверную ошибку через resetError', () => {
    formField.setServerError('new error');
    formField.resetError();

    expect(formField.error).toBeUndefined();
    expect(formField.isClientError).toBe(false);
    expect(formField.isServerError).toBe(false);
  });

  describe('работа с типом map', () => {
    it('должен создавать и работать с полем формы типа map', () => {
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

      const mapValue = mapFormField.getField().getValue();

      expect(mapValue.get('1')).toEqual(device1);
      expect(mapValue.get('2')).toEqual(device2);

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

    it('должен обрабатывать пустую коллекцию', () => {
      // Проверяем начальное состояние
      expect(mapFormField.value.size).toBe(0);
      expect(mapFormField.getField().getValue().size).toBe(0);

      // Устанавливаем пустую коллекцию
      mapFormField.setValue({});

      expect(mapFormField.value.size).toBe(0);
      expect(mapFormField.getField().getValue().size).toBe(0);
      expect(mapFormField.getField().hasValid()).toBe(true);
    });

    it('должен создавать поле формы с предзаполненными значениями', () => {
      // Создаем предзаполненные данные
      const initialDevices = {
        1: { id: '1', name: 'Device 1' },
        2: { id: '2', name: 'Device 2' },
        3: { id: '3', name: 'Device 3' },
      };

      // Создаем экземпляр с предзаполненными данными
      const preFilledMapFormField = MapFormField.create({
        field: { value: initialDevices },
      });

      // Проверяем, что данные корректно установлены
      expect(preFilledMapFormField.value.size).toBe(3);

      const preFilledValue = preFilledMapFormField.getField().getValue();

      expect(preFilledValue.get('1')).toEqual(initialDevices['1']);
      expect(preFilledValue.get('2')).toEqual(initialDevices['2']);
      expect(preFilledValue.get('3')).toEqual(initialDevices['3']);

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

      const newValue = preFilledMapFormField.getField().getValue();

      expect(newValue.get('4')).toEqual(newDevice);

      // Проверяем, что можно удалять элементы
      const { 3: removed, ...remainingDevices } = initialDevices;

      preFilledMapFormField.setValue(remainingDevices);

      expect(preFilledMapFormField.value.size).toBe(2);

      const finalValue = preFilledMapFormField.getField().getValue();

      expect(finalValue.get('3')).toBeUndefined();
      expect(finalValue.get('1')).toEqual(initialDevices['1']);
      expect(finalValue.get('2')).toEqual(initialDevices['2']);
    });
  });

  describe('управление состоянием disabled', () => {
    it('должен управлять состоянием disabled', () => {
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

  describe('setValueGuarded', () => {
    it('должен устанавливать значение, если canSetValue возвращает true', () => {
      guardedFormField.setValueGuarded('allowed value');

      expect(guardedFormField.value).toBe('allowed value');
    });

    it('должен не устанавливать значение, если canSetValue возвращает false', () => {
      const initialValue = guardedFormField.value;

      guardedFormField.setValueGuarded('forbidden');

      expect(guardedFormField.value).toBe(initialValue);
    });

    it('должен быть доступен через getField().setValueGuarded()', () => {
      expect(guardedFormField.getField()).toHaveProperty('setValueGuarded');

      const field = guardedFormField.getField();

      field.setValueGuarded('test value');

      expect(guardedFormField.value).toBe('test value');
    });
  });
});
