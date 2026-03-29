/// <reference types="jest" />
import { types as typesMST } from 'mobx-state-tree';

import createSyncModel from '../createSyncModel';

// Простой мок DataModel для тестирования
const MockDataModel = typesMST
  .model('MockData', {
    testField1: typesMST.optional(typesMST.string, ''),
    testField2: typesMST.optional(typesMST.string, ''),
  })
  .actions((self) => {
    return {
      fill: (data: { testField1: string; testField2?: string }) => {
        Object.assign(self, {
          testField1: data.testField1,
          testField2: data.testField2 ?? self.testField2,
        });
      },
    };
  });

describe('createSyncModel', () => {
  describe('базовое создание модели', () => {
    it('должен создать модель с полями testField1 и testField2', () => {
      const Model = createSyncModel(MockDataModel);
      const instance = Model.create({});

      expect(instance.data.testField1).toBe('');
      expect(instance.data.testField2).toBe('');
    });

    it('должен добавить метод fill', () => {
      const Model = createSyncModel(MockDataModel);
      const instance = Model.create({});

      expect(typeof instance.fill).toBe('function');
    });

    it('должен добавить методы lifecycle', () => {
      const Model = createSyncModel(MockDataModel);
      const instance = Model.create({});

      expect(typeof instance.afterCreate).toBe('function');
      expect(typeof instance.beforeDestroy).toBe('function');
    });
  });

  describe('интеграционные сценарии', () => {
    it('должен правильно обрабатывать несколько циклов', () => {
      const Model = createSyncModel(MockDataModel);
      const instance = Model.create({});

      // Первый цикл
      instance.fill({ testField1: 'first' });
      instance.fill({ testField1: 'changed first' });
      expect(instance.data.testField1).toBe('changed first');

      // Второй цикл
      instance.fill({ testField1: 'second' });
      instance.fill({ testField1: 'changed second' });
      expect(instance.data.testField1).toBe('changed second');
    });
  });

  describe('возможность расширения', () => {
    it('должен позволять добавлять дополнительные views', () => {
      const ExtendedModel = createSyncModel(MockDataModel).views((self) => {
        return {
          get upperCaseField() {
            return self.data.testField1.toUpperCase();
          },
        };
      });

      const instance = ExtendedModel.create({});

      instance.fill({ testField1: 'hello' });

      expect((instance as { upperCaseField: string }).upperCaseField).toBe('HELLO');
    });

    it('должен позволять добавлять дополнительные actions', () => {
      const ExtendedModel = createSyncModel(MockDataModel).actions((self) => {
        return {
          customFillAndRemember: (data: { testField1: string }) => {
            const typedSelf = self as {
              fill: (data: { testField1: string }) => void;
            };

            typedSelf.fill(data);
          },
        };
      });

      const instance = ExtendedModel.create({});
      const typedInstance = instance as {
        customFillAndRemember: (data: { testField1: string }) => void;
      };

      typedInstance.customFillAndRemember({
        testField1: 'custom',
      });

      expect(instance.data.testField1).toBe('custom');
    });
  });

  describe('lifecycle методы', () => {
    it('должен корректно создаваться и уничтожаться', () => {
      const Model = createSyncModel(MockDataModel);
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

  describe('Изменения состояния синхронизации', () => {
    it('isSyncInProgress должен возвращать true, если синхронизация в процессе', () => {
      const Model = createSyncModel(MockDataModel);
      const instance = Model.create({});

      expect(instance.isNotSynced).toBe(true);

      instance.setSyncInProgress();

      expect(instance.isSyncInProgress).toBe(true);
    });

    it('isSynced должен возвращать true, если синхронизация завершена после синхронизации', () => {
      const Model = createSyncModel(MockDataModel);
      const instance = Model.create({});

      expect(instance.isSynced).toBe(false);

      // не должно быть синхронизировано если не было ожидания синхронизации
      instance.setSynced();
      expect(instance.isSynced).toBe(false);

      instance.setSyncInProgress();
      instance.setSynced();

      expect(instance.isSynced).toBe(true);
    });

    it('isSyncError должен возвращать true, если синхронизация завершена с ошибкой', () => {
      const Model = createSyncModel(MockDataModel);
      const instance = Model.create({});

      expect(instance.isSyncError).toBe(false);

      // не должно быть синхронизировано если не было ожидания синхронизации
      instance.setSyncError();
      expect(instance.isSyncError).toBe(false);

      instance.setSyncInProgress();
      instance.setSyncError();

      expect(instance.isSyncError).toBe(true);
    });

    it('isSyncRetry должен возвращать true, если идет повторная синхронизация', () => {
      const Model = createSyncModel(MockDataModel);
      const instance = Model.create({});

      expect(instance.isSyncRetry).toBe(false);

      // не должно быть повторной синхронизации если не было ожидания синхронизации
      instance.setSyncRetry();
      expect(instance.isSyncRetry).toBe(false);

      instance.setSyncInProgress();
      instance.setSyncRetry();

      expect(instance.isSyncRetry).toBe(true);
    });
  });

  describe('сохранение типизации', () => {
    it('должен передавать правильную структуру данных в методы fields', () => {
      const Model = createSyncModel(MockDataModel);
      const instance = Model.create({});

      const fillSpy = jest.spyOn(instance, 'fill');

      const testData = { testField1: 'type test' };

      instance.fill(testData);

      expect(fillSpy).toHaveBeenCalledWith(testData);
      expect(instance.data.testField1).toBe('type test');
    });
  });
});
