/// <reference types="jest" />
import { types as typesMST } from 'mobx-state-tree';

import createModelWithAction from '../createModelWithAction';

// Простой мок DataModel для тестирования
const MockDataModel = typesMST
  .model('MockData', {
    testField1: typesMST.optional(typesMST.string, ''),
    testField2: typesMST.optional(typesMST.string, ''),
  })
  .actions((self) => {
    return {
      anyMethod: (data: { testField1: string; testField2?: string }) => {
        Object.assign(self, {
          testField1: data.testField1,
          testField2: data.testField2 ?? self.testField2,
        });
      },
    };
  });

describe('createModelWithAction', () => {
  describe('базовое создание модели', () => {
    it('должен создать модель с полями testField1 и testField2', () => {
      const Model = createModelWithAction(MockDataModel);

      const instance = Model.create();

      expect(instance.data.testField1).toBe('');
      expect(instance.data.testField2).toBe('');
    });

    it('должен добавить поле isActionInProgress с начальным значением false', () => {
      const Model = createModelWithAction(MockDataModel);
      const instance = Model.create({});

      expect(instance.isActionInProgress).toBe(false);
    });

    it('должен добавить метод anyMethod', () => {
      const Model = createModelWithAction(MockDataModel);
      const instance = Model.create({});

      expect(typeof instance.data.anyMethod).toBe('function');
    });

    it('должен добавить методы управления действиями', () => {
      const Model = createModelWithAction(MockDataModel);
      const instance = Model.create({});

      expect(typeof instance.startAction).toBe('function');
      expect(typeof instance.endAction).toBe('function');
    });
  });

  describe('управление состоянием действий', () => {
    it('должен устанавливать isActionInProgress в true при вызове startAction', () => {
      const Model = createModelWithAction(MockDataModel);
      const instance = Model.create({});

      expect(instance.isActionInProgress).toBe(false);

      instance.startAction();

      expect(instance.isActionInProgress).toBe(true);
    });

    it('должен устанавливать isActionInProgress в false при вызове endAction', () => {
      const Model = createModelWithAction(MockDataModel);
      const instance = Model.create({});

      instance.startAction();
      expect(instance.isActionInProgress).toBe(true);

      instance.endAction();
      expect(instance.isActionInProgress).toBe(false);
    });

    it('должен корректно обрабатывать множественные вызовы startAction и endAction', () => {
      const Model = createModelWithAction(MockDataModel);
      const instance = Model.create({});

      // Первый цикл
      instance.startAction();
      expect(instance.isActionInProgress).toBe(true);

      instance.endAction();
      expect(instance.isActionInProgress).toBe(false);

      // Второй цикл
      instance.startAction();
      expect(instance.isActionInProgress).toBe(true);

      instance.endAction();
      expect(instance.isActionInProgress).toBe(false);
    });
  });

  describe('возможность расширения', () => {
    it('должен позволять добавлять дополнительные views', () => {
      const ExtendedModel = createModelWithAction(MockDataModel).views((self) => {
        return {
          get upperCaseField() {
            return self.data.testField1.toUpperCase();
          },
          get isActionAndHasData() {
            return self.isActionInProgress && self.data.testField1.length > 0;
          },
        };
      });

      const instance = ExtendedModel.create({});

      instance.data.anyMethod({ testField1: 'hello' });
      instance.startAction();

      expect((instance as { upperCaseField: string }).upperCaseField).toBe('HELLO');
      expect((instance as { isActionAndHasData: boolean }).isActionAndHasData).toBe(true);
    });

    it('должен позволять добавлять дополнительные actions', () => {
      const ExtendedModel = createModelWithAction(MockDataModel).actions((self) => {
        return {
          fillWithAction: (data: { testField1: string }) => {
            self.startAction();
            self.data.anyMethod(data);
            self.endAction();
          },
        };
      });

      const instance = ExtendedModel.create({});
      const typedInstance = instance as {
        fillWithAction: (data: { testField1: string }) => void;
      };

      typedInstance.fillWithAction({ testField1: 'custom' });

      expect(instance.data.testField1).toBe('custom');
      expect(instance.isActionInProgress).toBe(false);
    });
  });

  describe('сохранение типизации', () => {
    it('должен передавать правильную структуру данных в методы fields', () => {
      const Model = createModelWithAction(MockDataModel);
      const instance = Model.create({});

      const anyMethodSpy = jest.spyOn(instance.data, 'anyMethod');

      const testData = { testField1: 'type test' };

      instance.data.anyMethod(testData);

      expect(anyMethodSpy).toHaveBeenCalledWith(testData);
      expect(instance.data.testField1).toBe('type test');
    });
  });
});
