/// <reference types="jest" />
import { types as typesMST } from 'mobx-state-tree';

import createFormSyncModel from '../createFormSyncModel';

// Простой мок FieldsModel для тестирования форм
const MockFormFieldsModel = typesMST
  .model('MockFormFields', {
    testField: typesMST.optional(typesMST.string, ''),
    isValid: typesMST.optional(typesMST.boolean, true),
  })
  .volatile(() => {
    return {
      rememberedState: undefined as { testField: string; isValid: boolean } | undefined,
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
      hasValid() {
        return self.isValid;
      },
      hasEqualState() {
        if (!self.rememberedState) {
          return false;
        }

        return (
          self.testField === self.rememberedState.testField &&
          self.isValid === self.rememberedState.isValid
        );
      },
    };
  })
  .actions((self) => {
    return {
      fill: (data: { testField: string; isValid: boolean }) => {
        Object.assign(self, { testField: data.testField, isValid: data.isValid });
      },
      rememberState: () => {
        Object.assign(self, { rememberedState: self.currentState });
      },
      resetToRememberState: () => {
        if (self.rememberedState !== undefined) {
          Object.assign(self, {
            testField: self.rememberedState.testField,
            isValid: self.rememberedState.isValid,
          });
        }
      },
    };
  });

describe('createFormSyncModel', () => {
  describe('базовое создание модели формы', () => {
    it('должен создать модель с полем fields', () => {
      const Model = createFormSyncModel(MockFormFieldsModel);
      const instance = Model.create({});

      expect(instance.fields).toBeDefined();
      expect(instance.fields.testField).toBe('');
      expect(instance.fields.isValid).toBe(true);
    });

    it('должен добавить базовые методы работы с полями', () => {
      const Model = createFormSyncModel(MockFormFieldsModel);
      const instance = Model.create({});

      expect(typeof instance.fill).toBe('function');
      expect(typeof instance.rememberState).toBe('function');
      expect(typeof instance.resetToRememberState).toBe('function');
    });

    it('должен добавить методы lifecycle', () => {
      const Model = createFormSyncModel(MockFormFieldsModel);
      const instance = Model.create({});

      expect(typeof instance.afterCreate).toBe('function');
      expect(typeof instance.beforeDestroy).toBe('function');
    });

    it('должен добавить методы управления состоянием формы от ModelSyncForm', () => {
      const Model = createFormSyncModel(MockFormFieldsModel);
      const instance = Model.create({});

      // Проверяем наличие методов управления состоянием
      expect('setSyncInProgress' in instance).toBe(true);
      expect('setSynced' in instance).toBe(true);
      expect('setSaveInProgress' in instance).toBe(true);
      expect('setSyncError' in instance).toBe(true);
      expect('setSaveError' in instance).toBe(true);
    });
  });

  describe('работа прокси-методов формы', () => {
    it('метод fill должен проксировать вызов к fields.fill', () => {
      const Model = createFormSyncModel(MockFormFieldsModel);
      const instance = Model.create({});

      const fillSpy = jest.spyOn(instance.fields, 'fill');

      const testData = { testField: 'form test value', isValid: false };

      instance.fill(testData);

      expect(fillSpy).toHaveBeenCalledWith(testData);
      expect(instance.fields.testField).toBe('form test value');
      expect(instance.fields.isValid).toBe(false);
    });

    it('метод rememberState должен проксировать вызов к fields.rememberState', () => {
      const Model = createFormSyncModel(MockFormFieldsModel);
      const instance = Model.create({});

      const rememberSpy = jest.spyOn(instance.fields, 'rememberState');

      instance.fill({ testField: 'remembered form value', isValid: true });
      instance.rememberState();

      expect(rememberSpy).toHaveBeenCalled();
      expect(instance.fields.rememberedState).toEqual({
        testField: 'remembered form value',
        isValid: true,
      });
    });

    it('метод resetToRememberState должен проксировать вызов к fields.resetToRememberState', () => {
      const Model = createFormSyncModel(MockFormFieldsModel);
      const instance = Model.create({});

      const resetSpy = jest.spyOn(instance.fields, 'resetToRememberState');

      // Заполняем и запоминаем
      instance.fill({ testField: 'original form', isValid: true });
      instance.rememberState();

      // Изменяем
      instance.fill({ testField: 'changed form', isValid: false });

      // Сбрасываем
      instance.resetToRememberState();

      expect(resetSpy).toHaveBeenCalled();
      expect(instance.fields.testField).toBe('original form');
      expect(instance.fields.isValid).toBe(true);
    });
  });

  describe('интеграционные сценарии форм', () => {
    it('должен работать полный цикл: fill -> remember -> change -> reset', () => {
      const Model = createFormSyncModel(MockFormFieldsModel);
      const instance = Model.create({});

      // Заполняем форму
      instance.fill({ testField: 'initial form value', isValid: true });
      expect(instance.fields.testField).toBe('initial form value');
      expect(instance.fields.isValid).toBe(true);

      // Запоминаем состояние
      instance.rememberState();
      expect(instance.fields.rememberedState?.testField).toBe('initial form value');

      // Изменяем данные
      instance.fill({ testField: 'modified form value', isValid: false });
      expect(instance.fields.testField).toBe('modified form value');
      expect(instance.fields.isValid).toBe(false);

      // Сбрасываем к запомненному состоянию
      instance.resetToRememberState();
      expect(instance.fields.testField).toBe('initial form value');
      expect(instance.fields.isValid).toBe(true);
    });

    it('должен правильно обрабатывать несколько циклов', () => {
      const Model = createFormSyncModel(MockFormFieldsModel);
      const instance = Model.create({});

      // Первый цикл
      instance.fill({ testField: 'first form', isValid: true });
      instance.rememberState();
      instance.fill({ testField: 'changed first form', isValid: false });
      instance.resetToRememberState();
      expect(instance.fields.testField).toBe('first form');
      expect(instance.fields.isValid).toBe(true);

      // Второй цикл
      instance.fill({ testField: 'second form', isValid: false });
      instance.rememberState();
      instance.fill({ testField: 'changed second form', isValid: true });
      instance.resetToRememberState();
      expect(instance.fields.testField).toBe('second form');
      expect(instance.fields.isValid).toBe(false);
    });
  });

  describe('возможность расширения формы', () => {
    it('должен позволять добавлять дополнительные views', () => {
      const ExtendedModel = createFormSyncModel(MockFormFieldsModel).views((self) => {
        return {
          get formattedField() {
            return `Form: ${(self.fields as { testField: string }).testField}`;
          },
          get isFormValid() {
            return (self.fields as { isValid: boolean }).isValid;
          },
        };
      });

      const instance = ExtendedModel.create({});

      instance.fill({ testField: 'hello form', isValid: true });

      expect((instance as { formattedField: string }).formattedField).toBe('Form: hello form');
      expect((instance as { isFormValid: boolean }).isFormValid).toBe(true);
    });

    it('должен позволять добавлять дополнительные actions', () => {
      const ExtendedModel = createFormSyncModel(MockFormFieldsModel).actions((self) => {
        return {
          customFillAndRemember: (data: { testField: string; isValid: boolean }) => {
            const typedSelf = self as {
              fill: (data: { testField: string; isValid: boolean }) => void;
              rememberState: () => void;
            };

            typedSelf.fill(data);
            typedSelf.rememberState();
          },
        };
      });

      const instance = ExtendedModel.create({});
      const typedInstance = instance as {
        customFillAndRemember: (data: { testField: string; isValid: boolean }) => void;
      };

      typedInstance.customFillAndRemember({
        testField: 'custom form',
        isValid: false,
      });

      expect(instance.fields.testField).toBe('custom form');
      expect(instance.fields.isValid).toBe(false);
      expect(instance.fields.rememberedState?.testField).toBe('custom form');
    });
  });

  describe('getCurrentFields метод', () => {
    it('должен возвращать текущее состояние полей', () => {
      const Model = createFormSyncModel(MockFormFieldsModel);
      const instance = Model.create({});

      instance.fill({ testField: 'current test', isValid: true });

      const currentFields = instance.getCurrentFields();

      expect(currentFields).toEqual({
        testField: 'current test',
        isValid: true,
      });
    });

    it('должен возвращать обновленное состояние после изменений', () => {
      const Model = createFormSyncModel(MockFormFieldsModel);
      const instance = Model.create({});

      // Первое состояние
      instance.fill({ testField: 'first', isValid: true });

      let currentFields = instance.getCurrentFields();

      expect(currentFields).toEqual({ testField: 'first', isValid: true });

      // Второе состояние
      instance.fill({ testField: 'second', isValid: false });
      currentFields = instance.getCurrentFields();
      expect(currentFields).toEqual({ testField: 'second', isValid: false });
    });
  });

  describe('lifecycle методы формы', () => {
    it('должен корректно создаваться и уничтожаться', () => {
      const Model = createFormSyncModel(MockFormFieldsModel);
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

  describe('сохранение типизации формы', () => {
    it('должен передавать правильную структуру данных в методы fields', () => {
      const Model = createFormSyncModel(MockFormFieldsModel);
      const instance = Model.create({});

      const fillSpy = jest.spyOn(instance.fields, 'fill');

      const testData = { testField: 'type test form', isValid: false };

      instance.fill(testData);

      expect(fillSpy).toHaveBeenCalledWith(testData);
      expect(instance.fields.testField).toBe('type test form');
      expect(instance.fields.isValid).toBe(false);
    });

    it('должен сохранять типы при работе с состоянием полей', () => {
      const Model = createFormSyncModel(MockFormFieldsModel);
      const instance = Model.create({});

      // Заполняем типизированными данными
      const formData = { testField: 'typed form data', isValid: true };

      instance.fill(formData);
      instance.rememberState();

      // Проверяем что типы сохранились
      expect(instance.fields.rememberedState).toEqual(formData);
      expect(typeof instance.fields.rememberedState?.testField).toBe('string');
      expect(typeof instance.fields.rememberedState?.isValid).toBe('boolean');
    });
  });
});
