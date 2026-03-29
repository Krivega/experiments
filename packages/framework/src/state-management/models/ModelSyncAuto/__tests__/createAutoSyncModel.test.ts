/// <reference types="jest" />
import { types as typesMST } from 'mobx-state-tree';

import createAutoSyncModel from '../createAutoSyncModel';

// Простой мок FieldsModel для тестирования
const MockFieldsModel = typesMST
  .model('MockFields', {
    testField: typesMST.optional(typesMST.string, ''),
    isValid: typesMST.optional(typesMST.boolean, true),
  })
  .volatile(() => {
    return {
      rememberedState: undefined as unknown as
        | { testField: string | undefined; isValid: boolean }
        | undefined,
      depends: {
        isValid: ['testField'],
      },
    };
  })
  .views((self) => {
    return {
      get currentState() {
        return {
          testField: self.testField,
          isValid: self.isValid,
        };
      },
      get affectedFields() {
        return {
          has: (key: 'testField' | 'isValid') => {
            return key === 'testField' && self.rememberedState?.isValid !== self.isValid;
          },
        };
      },
    };
  })
  .actions((self) => {
    return {
      fill: (data: { testField: string; isValid?: boolean } | string) => {
        if (typeof data === 'string') {
          Object.assign(self, { testField: data });
        } else {
          Object.assign(self, { testField: data.testField, isValid: data.isValid ?? self.isValid });
        }
      },
      rememberState: () => {
        Object.assign(self, {
          rememberedState: { testField: self.testField, isValid: self.isValid },
        });
      },
      resetToRememberState: () => {
        if (self.rememberedState !== undefined) {
          Object.assign(self, {
            testField: self.rememberedState.testField,
            isValid: self.rememberedState.isValid,
          });
        }
      },
      setRememberedState: (state: { testField?: string; isValid?: boolean }) => {
        Object.assign(self, { rememberedState: state });
      },
      hasEqualState() {
        return true;
      },
    };
  });

describe('createAutoSyncModel', () => {
  describe('базовое создание модели', () => {
    it('должен создать модель с полем fields', () => {
      const Model = createAutoSyncModel(MockFieldsModel);
      const instance = Model.create({});

      expect(instance.fields).toBeDefined();
      expect(instance.fields.testField).toBe('');
      expect(instance.fields.isValid).toBe(true);
    });

    it('должен добавить базовые методы', () => {
      const Model = createAutoSyncModel(MockFieldsModel);
      const instance = Model.create({});

      expect(typeof instance.fill).toBe('function');
      expect(typeof instance.rememberState).toBe('function');
      expect(typeof instance.resetToRememberState).toBe('function');
      expect(typeof instance.canChangeField).toBe('function');
    });

    it('должен добавить методы lifecycle', () => {
      const Model = createAutoSyncModel(MockFieldsModel);
      const instance = Model.create({});

      expect(typeof instance.afterCreate).toBe('function');
      expect(typeof instance.beforeDestroy).toBe('function');
    });
  });

  describe('состояния', () => {
    it('isAvailableFilling должен возвращать true если isSyncReady или isLoading', () => {
      const Model = createAutoSyncModel(MockFieldsModel);
      const instance = Model.create({});

      instance.setSyncInProgress();

      expect(instance.isLoading).toBe(true);
      expect(instance.isAvailableFilling).toBe(true);

      instance.setSyncRetry();

      expect(instance.isLoading).toBe(true);
      expect(instance.isAvailableFilling).toBe(true);

      instance.setSynced();

      expect(instance.isSyncReady).toBe(true);
      expect(instance.isAvailableFilling).toBe(true);

      instance.setNotSaved();
      instance.setSaveInProgress();

      expect(instance.isSyncReady).toBe(false);

      instance.setSaveError();

      expect(instance.isSyncReady).toBe(true);
      expect(instance.isAvailableFilling).toBe(true);
    });
  });

  describe('работа прокси-методов', () => {
    it('метод fill должен проксировать вызов к fields.fill когда isAvailableFilling = true', () => {
      const Model = createAutoSyncModel(MockFieldsModel);
      const instance = Model.create({});

      // Устанавливаем состояние, при котором fill доступен
      instance.setSyncInProgress();

      const fillSpy = jest.spyOn(instance.fields, 'fill');

      instance.fill({ testField: 'test value' });

      expect(fillSpy).toHaveBeenCalledWith({ testField: 'test value' });
      expect(instance.fields.testField).toBe('test value');
    });

    it('метод fill должен обновлять rememberedState когда isAvailableFilling = false', () => {
      const Model = createAutoSyncModel(MockFieldsModel);
      const instance = Model.create({});

      // По умолчанию модель в состоянии NotSynced, поэтому fill недоступен
      expect(instance.isNotSynced).toBe(true);

      const setRememberedStateSpy = jest.spyOn(instance.fields, 'setRememberedState');

      instance.fill({ testField: 'test value' });

      expect(setRememberedStateSpy).toHaveBeenCalledWith({ testField: 'test value' });
      expect(instance.fields.testField).toBe(''); // Поле не изменилось
    });

    it('метод fill должен объединять rememberedState с новыми данными когда isAvailableFilling = false', () => {
      const Model = createAutoSyncModel(MockFieldsModel);
      const instance = Model.create({});

      expect(instance.isNotSynced).toBe(true);

      instance.fields.setRememberedState({ testField: 'existing', isValid: true });

      const setRememberedStateSpy = jest.spyOn(instance.fields, 'setRememberedState');

      instance.fill({ testField: 'new value' });

      expect(setRememberedStateSpy).toHaveBeenCalledWith({
        testField: 'new value',
        isValid: true,
      });
    });

    it('метод fill должен обрабатывать undefined в rememberedState', () => {
      const Model = createAutoSyncModel(MockFieldsModel);
      const instance = Model.create({});

      // По умолчанию модель в состоянии NotSynced
      expect(instance.isNotSynced).toBe(true);
      expect(instance.fields.rememberedState).toBe(undefined);

      const setRememberedStateSpy = jest.spyOn(instance.fields, 'setRememberedState');

      instance.fill({ testField: 'new value' });

      expect(setRememberedStateSpy).toHaveBeenCalledWith({ testField: 'new value' });
    });

    it('метод fill должен обрабатывать примитивы при заполнении rememberedState', () => {
      const Model = createAutoSyncModel(MockFieldsModel);
      const instance = Model.create({});

      expect(instance.isNotSynced).toBe(true);

      const setRememberedStateSpy = jest.spyOn(instance.fields, 'setRememberedState');

      instance.fill('test string');

      expect(setRememberedStateSpy).toHaveBeenCalledWith('test string');
    });

    it('метод fill должен обрабатывать undefined', () => {
      const Model = createAutoSyncModel(MockFieldsModel);
      const instance = Model.create({});

      expect(instance.isNotSynced).toBe(true);

      const setRememberedStateSpy = jest.spyOn(instance.fields, 'setRememberedState');

      // @ts-expect-error - должен не вызывать fields.fill
      instance.fill(undefined);

      expect(setRememberedStateSpy).toHaveBeenCalledWith(undefined);
    });

    it('метод rememberState должен проксировать вызов к fields.rememberState', () => {
      const Model = createAutoSyncModel(MockFieldsModel);
      const instance = Model.create({});

      const rememberSpy = jest.spyOn(instance.fields, 'rememberState');
      const testData = { testField: 'remembered value', isValid: true };

      instance.setSyncInProgress();
      instance.fill(testData);
      instance.rememberState();

      expect(rememberSpy).toHaveBeenCalled();
      expect(instance.fields.rememberedState).toEqual(testData);
    });

    it('метод resetToRememberState должен проксировать вызов к fields.resetToRememberState', () => {
      const Model = createAutoSyncModel(MockFieldsModel);
      const instance = Model.create({});

      const resetSpy = jest.spyOn(instance.fields, 'resetToRememberState');

      instance.setSyncInProgress();

      // Заполняем и запоминаем
      instance.fill({ testField: 'original' });
      instance.rememberState();

      // Изменяем
      instance.fill({ testField: 'changed' });

      // Сбрасываем
      instance.resetToRememberState();

      expect(resetSpy).toHaveBeenCalled();
      expect(instance.fields.testField).toEqual('original');
    });
  });

  describe('интеграционные сценарии', () => {
    it('должен работать полный цикл: fill -> remember -> change -> reset', () => {
      const Model = createAutoSyncModel(MockFieldsModel);
      const instance = Model.create({});

      instance.setSyncInProgress();

      // Заполняем данными
      instance.fill({ testField: 'initial value', isValid: true });
      expect(instance.fields.testField).toBe('initial value');

      // Запоминаем состояние
      instance.rememberState();
      expect(instance.fields.rememberedState).toEqual({
        testField: 'initial value',
        isValid: true,
      });

      // Изменяем данные
      instance.fill({ testField: 'modified value' });
      expect(instance.fields.testField).toBe('modified value');

      // Сбрасываем к запомненному состоянию
      instance.resetToRememberState();
      expect(instance.fields.testField).toBe('initial value');
    });

    it('должен правильно обрабатывать несколько циклов', () => {
      const Model = createAutoSyncModel(MockFieldsModel);
      const instance = Model.create({});

      instance.setSyncInProgress();

      // Первый цикл
      instance.fill({ testField: 'first' });
      instance.rememberState();
      instance.fill({ testField: 'changed first' });
      instance.resetToRememberState();
      expect(instance.fields.testField).toBe('first');

      // Второй цикл
      instance.fill({ testField: 'second' });
      instance.rememberState();
      instance.fill({ testField: 'changed second' });
      instance.resetToRememberState();
      expect(instance.fields.testField).toBe('second');
    });
  });

  describe('возможность расширения', () => {
    it('должен позволять добавлять дополнительные views', () => {
      const ExtendedModel = createAutoSyncModel(MockFieldsModel).views((self) => {
        return {
          get upperCaseField() {
            return (self.fields as { testField: string }).testField.toUpperCase();
          },
        };
      });

      const instance = ExtendedModel.create({});

      instance.setSyncInProgress();
      instance.fill({ testField: 'hello' });

      expect((instance as { upperCaseField: string }).upperCaseField).toBe('HELLO');
    });

    it('должен позволять добавлять дополнительные actions', () => {
      const ExtendedModel = createAutoSyncModel(MockFieldsModel).actions((self) => {
        return {
          customFillAndRemember: (data: { testField: string }) => {
            const typedSelf = self as {
              fill: (data: { testField: string }) => void;
              rememberState: () => void;
            };

            typedSelf.fill(data);
            typedSelf.rememberState();
          },
        };
      });

      const instance = ExtendedModel.create({});
      const typedInstance = instance as {
        customFillAndRemember: (data: { testField: string }) => void;
      };

      instance.setSyncInProgress();

      typedInstance.customFillAndRemember({
        testField: 'custom',
      });

      expect(instance.fields.testField).toBe('custom');
      expect(instance.fields.rememberedState).toEqual({ isValid: true, testField: 'custom' });
    });
  });

  describe('lifecycle методы', () => {
    it('должен корректно создаваться и уничтожаться', () => {
      const Model = createAutoSyncModel(MockFieldsModel);
      const instance = Model.create({});

      expect(typeof instance.afterCreate).toBe('function');
      expect(typeof instance.beforeDestroy).toBe('function');

      // Проверяем что методы lifecycle не падают
      expect(() => {
        instance.afterCreate();
        instance.beforeDestroy();
      }).not.toThrow();
    });
  });

  describe('Изменения и зависимости', () => {
    const initialDependencies = {
      isValid: ['testField'],
    };

    it('заданные зависимости', () => {
      const Model = createAutoSyncModel(MockFieldsModel);
      const instance = Model.create({});

      expect(instance.fields.depends).toEqual(initialDependencies);
    });

    it('canChangeField до синхронизации всегда возвращает false', () => {
      const Model = createAutoSyncModel(MockFieldsModel);
      const instance = Model.create({});

      instance.setSyncInProgress();

      expect(instance.isNotReady).toBe(true);
      expect(instance.canChangeField('testField')).toBe(false);

      instance.fill({ testField: 'testField-text', isValid: false });
      instance.setSynced();

      expect(instance.isNotReady).toBe(false);
      expect(instance.isSynced).toBe(true);
      expect(instance.canChangeField('testField')).toBe(true);
    });

    it('canChangeField возвращает true, если зависимое поле сохраняется', () => {
      const Model = createAutoSyncModel(MockFieldsModel);
      const instance = Model.create({});

      expect(instance.fields.depends.isValid.includes('testField')).toBe(true);

      instance.setSyncInProgress();

      instance.fill({ testField: 'testField-text', isValid: false });
      instance.rememberState();
      instance.setSynced();

      expect(instance.fields.affectedFields.has('testField')).toBe(false);
      expect(instance.canChangeField('testField')).toBe(true);

      instance.fill({ testField: 'testField-text', isValid: true });
      instance.setNotSaved();

      expect(instance.fields.affectedFields.has('testField')).toBe(true);
      expect(instance.canChangeField('testField')).toBe(true);

      instance.setSaveInProgress();

      expect(instance.canChangeField('testField')).toBe(false);

      instance.rememberState();
      instance.setSaved();

      expect(instance.canChangeField('testField')).toBe(true);
    });
  });

  describe('сохранение типизации', () => {
    it('должен передавать правильную структуру данных в методы fields', () => {
      const Model = createAutoSyncModel(MockFieldsModel);
      const instance = Model.create({});

      const fillSpy = jest.spyOn(instance.fields, 'fill');

      const testData = { testField: 'type test' };

      instance.setSyncInProgress();
      instance.fill(testData);

      expect(fillSpy).toHaveBeenCalledWith(testData);
      expect(instance.fields.testField).toBe('type test');
    });
  });
});
