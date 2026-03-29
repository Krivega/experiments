/// <reference types="jest" />
import { types as typesMST } from 'mobx-state-tree';

import createSyncModelWithAction from '../createSyncModelWithAction';

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

describe('createSyncModelWithAction', () => {
  describe('базовое создание модели', () => {
    it('должен создать модель с полями testField1 и testField2', () => {
      const Model = createSyncModelWithAction(MockDataModel);
      const instance = Model.create({});

      expect(instance.data.testField1).toBe('');
      expect(instance.data.testField2).toBe('');
    });

    it('должен добавить поле isActionInProgress с начальным значением false', () => {
      const Model = createSyncModelWithAction(MockDataModel);
      const instance = Model.create({});

      expect(instance.isActionInProgress).toBe(false);
    });

    it('должен добавить метод fill', () => {
      const Model = createSyncModelWithAction(MockDataModel);
      const instance = Model.create({});

      expect(typeof instance.fill).toBe('function');
    });

    it('должен добавить методы управления действиями', () => {
      const Model = createSyncModelWithAction(MockDataModel);
      const instance = Model.create({});

      expect(typeof instance.startAction).toBe('function');
      expect(typeof instance.endAction).toBe('function');
    });

    it('должен добавить методы lifecycle', () => {
      const Model = createSyncModelWithAction(MockDataModel);
      const instance = Model.create({});

      expect(typeof instance.afterCreate).toBe('function');
      expect(typeof instance.beforeDestroy).toBe('function');
    });
  });

  describe('управление состоянием действий', () => {
    it('должен устанавливать isActionInProgress в true при вызове startAction', () => {
      const Model = createSyncModelWithAction(MockDataModel);
      const instance = Model.create({});

      expect(instance.isActionInProgress).toBe(false);

      instance.startAction();

      expect(instance.isActionInProgress).toBe(true);
    });

    it('должен устанавливать isActionInProgress в false при вызове endAction', () => {
      const Model = createSyncModelWithAction(MockDataModel);
      const instance = Model.create({});

      instance.startAction();
      expect(instance.isActionInProgress).toBe(true);

      instance.endAction();
      expect(instance.isActionInProgress).toBe(false);
    });

    it('должен корректно обрабатывать множественные вызовы startAction и endAction', () => {
      const Model = createSyncModelWithAction(MockDataModel);
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

  describe('функциональность fill', () => {
    it('должен корректно проксировать метод fill к вложенной модели', () => {
      const Model = createSyncModelWithAction(MockDataModel);
      const instance = Model.create({});

      instance.fill({ testField1: 'test value' });

      expect(instance.data.testField1).toBe('test value');
    });

    it('должен сохранять типизацию при вызове fill', () => {
      const Model = createSyncModelWithAction(MockDataModel);
      const instance = Model.create({});

      const testData = {
        testField1: 'typed test',
        testField2: 'optional field',
      };

      instance.fill(testData);

      expect(instance.data.testField1).toBe('typed test');
      expect(instance.data.testField2).toBe('optional field');
    });
  });

  describe('интеграционные сценарии', () => {
    it('должен правильно обрабатывать несколько циклов заполнения данных', () => {
      const Model = createSyncModelWithAction(MockDataModel);
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

    it('должен позволять одновременно управлять действиями и данными', () => {
      const Model = createSyncModelWithAction(MockDataModel);
      const instance = Model.create({});

      instance.startAction();
      instance.fill({ testField1: 'during action' });

      expect(instance.isActionInProgress).toBe(true);
      expect(instance.data.testField1).toBe('during action');

      instance.endAction();

      expect(instance.isActionInProgress).toBe(false);
      expect(instance.data.testField1).toBe('during action');
    });
  });

  describe('возможность расширения', () => {
    it('должен позволять добавлять дополнительные views', () => {
      const ExtendedModel = createSyncModelWithAction(MockDataModel).views((self) => {
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

      instance.fill({ testField1: 'hello' });
      instance.startAction();

      expect((instance as { upperCaseField: string }).upperCaseField).toBe('HELLO');
      expect((instance as { isActionAndHasData: boolean }).isActionAndHasData).toBe(true);
    });

    it('должен позволять добавлять дополнительные actions', () => {
      const ExtendedModel = createSyncModelWithAction(MockDataModel).actions((self) => {
        return {
          fillWithAction: (data: { testField1: string }) => {
            const typedSelf = self as {
              startAction: () => void;
              fill: (data: { testField1: string }) => void;
              endAction: () => void;
            };

            typedSelf.startAction();
            typedSelf.fill(data);
            typedSelf.endAction();
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

  describe('lifecycle методы', () => {
    it('должен корректно создаваться и уничтожаться', () => {
      const Model = createSyncModelWithAction(MockDataModel);
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

  describe('изменения состояния синхронизации', () => {
    it('isSyncInProgress должен возвращать true, если синхронизация в процессе', () => {
      const Model = createSyncModelWithAction(MockDataModel);
      const instance = Model.create({});

      expect(instance.isNotSynced).toBe(true);

      instance.setSyncInProgress();

      expect(instance.isSyncInProgress).toBe(true);
    });

    it('isSynced должен возвращать true, если синхронизация завершена после синхронизации', () => {
      const Model = createSyncModelWithAction(MockDataModel);
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
      const Model = createSyncModelWithAction(MockDataModel);
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
      const Model = createSyncModelWithAction(MockDataModel);
      const instance = Model.create({});

      expect(instance.isSyncRetry).toBe(false);

      // не должно быть повторной синхронизации если не было ожидания синхронизации
      instance.setSyncRetry();
      expect(instance.isSyncRetry).toBe(false);

      instance.setSyncInProgress();
      instance.setSyncRetry();

      expect(instance.isSyncRetry).toBe(true);
    });

    it('должен корректно работать с синхронизацией во время выполнения действий', () => {
      const Model = createSyncModelWithAction(MockDataModel);
      const instance = Model.create({});

      // Начинаем действие и синхронизацию одновременно
      instance.startAction();
      instance.setSyncInProgress();

      expect(instance.isActionInProgress).toBe(true);
      expect(instance.isSyncInProgress).toBe(true);

      // Завершаем синхронизацию
      instance.setSynced();

      expect(instance.isActionInProgress).toBe(true);
      expect(instance.isSynced).toBe(true);

      // Завершаем действие
      instance.endAction();

      expect(instance.isActionInProgress).toBe(false);
      expect(instance.isSynced).toBe(true);
    });
  });

  describe('сохранение типизации', () => {
    it('должен передавать правильную структуру данных в методы fields', () => {
      const Model = createSyncModelWithAction(MockDataModel);
      const instance = Model.create({});

      const fillSpy = jest.spyOn(instance, 'fill');

      const testData = { testField1: 'type test' };

      instance.fill(testData);

      expect(fillSpy).toHaveBeenCalledWith(testData);
      expect(instance.data.testField1).toBe('type test');
    });
  });
});
