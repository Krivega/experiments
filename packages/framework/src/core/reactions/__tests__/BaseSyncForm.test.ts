/// <reference types="jest" />
/* eslint-disable max-classes-per-file */
import { flushPromises } from '@experiments/test-utils';

import { BaseSyncForm } from '../BaseSyncForm';

import type { IServerApi, ISyncFormInstance } from '../BaseSyncForm';

// Моки для зависимостей
const mockDebugFunction = jest.fn();

jest.mock('@/utils/logger', () => {
  return {
    debugResolve: jest.fn(() => {
      return mockDebugFunction;
    }),
  };
});

// Типы для тестирования

interface ITestData {
  state: {
    id: string;
    name: string;
  };
  dependentData: Record<string, unknown>;
}

// Конкретная реализация BaseSyncForm для тестирования
class TestSyncForm extends BaseSyncForm<ITestData> {
  // Публичные геттеры для тестирования защищенных свойств
  public get testInstance() {
    return this.instance;
  }

  public get testServerApi() {
    return this.dependencies.serverApi;
  }

  public get testDebug() {
    return this.debug;
  }

  public get testUnsubscribe() {
    return this.unsubscribe;
  }

  // Публичные методы для тестирования защищенных методов
  public testHandleSuccess(data: ITestData): void {
    this.handleSuccess(data);
  }

  public testHandleError(error: unknown): void {
    this.handleError(error);
  }

  public testHasAvailableWriteFromSocket(): boolean {
    return this.hasAvailableWriteFromSocket();
  }

  public testWriteFromSocket(data: ITestData): void {
    this.writeFromSocket(data);
  }
}

// Создание моков
const createMockInstance = (): jest.Mocked<ISyncFormInstance<ITestData>> => {
  return {
    setSyncInProgress: jest.fn(),
    setSyncError: jest.fn(),
    fill: jest.fn(),
    isSaveInProgress: false,
  };
};

const mockAbort = jest.fn();
const mockServerApi: jest.Mocked<IServerApi<ITestData>> = {
  getData: jest.fn(() => {
    return {
      promise: Promise.resolve({ state: { id: '1', name: 'test' }, dependentData: {} }),
      abort: mockAbort,
    };
  }),
};

describe('BaseSyncForm', () => {
  let mockInstance: jest.Mocked<ISyncFormInstance<ITestData>>;
  let syncForm: TestSyncForm;

  beforeEach(() => {
    jest.clearAllMocks();
    mockInstance = createMockInstance();

    syncForm = new TestSyncForm({
      instance: mockInstance,
      dependencies: { serverApi: mockServerApi },
      executableActions: {},
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('конструктор', () => {
    it('должен правильно инициализировать экземпляр с переданными зависимостями', () => {
      expect(syncForm.testInstance).toBe(mockInstance);
      expect(syncForm.testServerApi).toBe(mockServerApi);
      expect(syncForm.testDebug).toBe(mockDebugFunction);
    });
  });

  describe('метод defineSync', () => {
    describe('успешный сценарий', () => {
      it('должен установить состояние "синхронизация в процессе" при запуске', () => {
        syncForm.start();

        expect(mockInstance.setSyncInProgress).toHaveBeenCalledTimes(1);
      });

      it('должен вызвать серверное API для получения данных', () => {
        syncForm.start();

        expect(mockServerApi.getData).toHaveBeenCalledTimes(1);
      });

      it('должен представить функцию отмены запроса', () => {
        mockServerApi.getData.mockReturnValue({
          promise: Promise.resolve({ state: { id: '1', name: 'test' }, dependentData: {} }),
          abort: mockAbort,
        });

        syncForm.start();
        syncForm.stop();

        expect(mockAbort).toHaveBeenCalled();
      });

      it('должен вызвать handleSuccess при успешном получении данных', async () => {
        const testData: ITestData = { state: { id: '2', name: 'success test' }, dependentData: {} };

        mockServerApi.getData.mockReturnValue({
          promise: Promise.resolve(testData),
          abort: mockAbort,
        });

        syncForm = new TestSyncForm({
          instance: mockInstance,
          dependencies: { serverApi: mockServerApi },
          executableActions: {},
        });

        syncForm.start();

        await flushPromises();

        expect(mockDebugFunction).toHaveBeenCalledWith('success:', testData);
        expect(mockInstance.fill).toHaveBeenCalledWith(testData.state, testData.dependentData);
      });
    });

    describe('сценарий с ошибкой', () => {
      it('должен вызвать handleError при ошибке получения данных', async () => {
        mockServerApi.getData.mockReturnValue({
          promise: Promise.reject(new Error('API Error')),
          abort: mockAbort,
        });

        syncForm = new TestSyncForm({
          instance: mockInstance,
          dependencies: { serverApi: mockServerApi },
          executableActions: {},
        });

        syncForm.start();

        await flushPromises();

        expect(mockDebugFunction).toHaveBeenCalledWith('error:', expect.any(Error));
        expect(mockInstance.setSyncError).toHaveBeenCalledTimes(1);
      });

      it('должен обработать различные типы ошибок', async () => {
        const errorCases = [
          new Error('Network Error'),
          new Error('String error'),
          new Error('Object error'),
          new Error('Null error'),
          new Error('Undefined error'),
        ];

        // Выполняем тесты последовательно для избежания проблем с общими моками

        for (const errorCase of errorCases) {
          jest.clearAllMocks();

          // Создаем новые моки для каждого теста
          const testMockInstance = createMockInstance();

          mockServerApi.getData.mockReturnValue({
            promise: Promise.reject(errorCase),
            abort: mockAbort,
          });

          const testSyncForm = new TestSyncForm({
            instance: testMockInstance,
            dependencies: { serverApi: mockServerApi },
            executableActions: {},
          });

          testSyncForm.start();

          // eslint-disable-next-line no-await-in-loop
          await flushPromises();

          expect(mockDebugFunction).toHaveBeenCalledWith('error:', errorCase);
          expect(testMockInstance.setSyncError).toHaveBeenCalledTimes(1);
        }
      });
    });
  });

  describe('метод handleSuccess', () => {
    it('должен логировать успешный результат', () => {
      const testData: ITestData = { state: { id: '3', name: 'logging test' }, dependentData: {} };

      syncForm.testHandleSuccess(testData);

      expect(mockDebugFunction).toHaveBeenCalledWith('success:', testData);
    });

    it('должен вызвать метод fill экземпляра с правильными параметрами', () => {
      const testData: ITestData = { state: { id: '4', name: 'fill test' }, dependentData: {} };

      syncForm.testHandleSuccess(testData);

      expect(mockInstance.fill).toHaveBeenCalledWith(testData.state, testData.dependentData);
    });

    it('должен работать с различными типами данных', () => {
      const dataCases: ITestData[] = [
        { state: { id: '1', name: 'simple' }, dependentData: {} },
        { state: { id: '2', name: 'with special chars áéíóú' }, dependentData: {} },
        { state: { id: '3', name: '' }, dependentData: {} }, // пустое имя
        { state: { id: '', name: 'empty id' }, dependentData: {} }, // пустой id
      ];

      dataCases.forEach((testData) => {
        jest.clearAllMocks();

        syncForm.testHandleSuccess(testData);

        expect(mockInstance.fill).toHaveBeenCalledWith(testData.state, testData.dependentData);
        expect(mockDebugFunction).toHaveBeenCalledWith('success:', testData);
      });
    });
  });

  describe('метод handleError', () => {
    it('должен логировать ошибку', () => {
      const testError = new Error('Test error');

      syncForm.testHandleError(testError);

      expect(mockDebugFunction).toHaveBeenCalledWith('error:', testError);
    });

    it('должен установить состояние ошибки синхронизации', () => {
      const testError = new Error('Test error');

      syncForm.testHandleError(testError);

      expect(mockInstance.setSyncError).toHaveBeenCalledTimes(1);
    });

    it('должен корректно обрабатывать различные типы ошибок', () => {
      const errorCases = [
        new Error('Standard error'),
        'String error message',
        { code: 500, message: 'Server error' },
        42, // number
        true, // boolean
        undefined,
      ];

      errorCases.forEach((error) => {
        jest.clearAllMocks();

        syncForm.testHandleError(error);

        expect(mockDebugFunction).toHaveBeenCalledWith('error:', error);
        expect(mockInstance.setSyncError).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('интеграционные тесты', () => {
    it('должен корректно выполнить полный цикл успешной синхронизации', async () => {
      const testData: ITestData = {
        state: { id: '5', name: 'integration test' },
        dependentData: {},
      };

      mockServerApi.getData.mockReturnValue({
        promise: Promise.resolve(testData),
        abort: mockAbort,
      });

      syncForm = new TestSyncForm({
        instance: mockInstance,
        dependencies: { serverApi: mockServerApi },
        executableActions: {},
      });

      syncForm.start();
      syncForm.stop();

      // Проверяем начальное состояние
      expect(mockInstance.setSyncInProgress).toHaveBeenCalledTimes(1);
      expect(mockServerApi.getData).toHaveBeenCalledTimes(1);
      expect(mockAbort).toHaveBeenCalled();

      await flushPromises();

      // Проверяем финальное состояние
      expect(mockDebugFunction).toHaveBeenCalledWith('success:', testData);
      expect(mockInstance.fill).toHaveBeenCalledWith(testData.state, testData.dependentData);
      expect(mockInstance.setSyncError).not.toHaveBeenCalled();
    });

    it('должен корректно выполнить полный цикл синхронизации с ошибкой', async () => {
      mockServerApi.getData.mockReturnValue({
        promise: Promise.reject(new Error('API Error')),
        abort: mockAbort,
      });

      syncForm = new TestSyncForm({
        instance: mockInstance,
        dependencies: { serverApi: mockServerApi },
        executableActions: {},
      });

      syncForm.start();
      syncForm.stop();

      // Проверяем начальное состояние
      expect(mockInstance.setSyncInProgress).toHaveBeenCalledTimes(1);
      expect(mockServerApi.getData).toHaveBeenCalledTimes(1);
      expect(mockAbort).toHaveBeenCalled();

      await flushPromises();

      // Проверяем финальное состояние
      expect(mockDebugFunction).toHaveBeenCalledWith('error:', expect.any(Error));
      expect(mockInstance.setSyncError).toHaveBeenCalledTimes(1);
      expect(mockInstance.fill).not.toHaveBeenCalled();
    });

    it('должен отменить предыдущую подписку при повторном вызове start', async () => {
      const testData: ITestData = {
        state: { id: '6', name: 'multiple calls test' },
        dependentData: {},
      };

      mockServerApi.getData.mockReturnValue({
        promise: Promise.resolve(testData),
        abort: mockAbort,
      });

      syncForm = new TestSyncForm({
        instance: mockInstance,
        dependencies: { serverApi: mockServerApi },
        executableActions: {},
      });

      // Выполняем несколько вызовов
      syncForm.start();
      syncForm.start();

      expect(mockAbort).toHaveBeenCalledTimes(1);
    });
  });

  describe('тестирование типизации', () => {
    it('должен корректно работать с типизированными данными', () => {
      // Проверяем, что TypeScript правильно выводит типы
      const testData: ITestData = {
        state: { id: 'typed-test', name: 'Type Safety Test' },
        dependentData: {},
      };

      syncForm.testHandleSuccess(testData);

      expect(mockInstance.fill).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'typed-test',
          name: 'Type Safety Test',
        }),
        testData.dependentData,
      );
    });

    it('должен поддерживать различные типы для TData и TFillData', () => {
      // Этот тест проверяет, что наша типизация работает корректно
      // В реальности TData и TFillData могут быть разными типами
      interface ISimpleData {
        value: string;
      }

      class TypedSyncForm extends BaseSyncForm<{ state: ISimpleData; dependentData: unknown }> {}

      const typedInstance: ISyncFormInstance<{ state: ISimpleData; dependentData: unknown }> = {
        setSyncInProgress: jest.fn(),
        setSyncError: jest.fn(),
        fill: jest.fn(),
        isSaveInProgress: false,
      };

      const typedServerApi: IServerApi<{ state: ISimpleData; dependentData: unknown }> = {
        getData: jest.fn(() => {
          return {
            promise: Promise.resolve({ state: { value: 'test' }, dependentData: {} }),
            abort: jest.fn(),
          };
        }),
      };

      const typedSyncForm = new TypedSyncForm({
        instance: typedInstance,
        dependencies: { serverApi: typedServerApi },
        executableActions: {},
      });

      // Проверяем, что экземпляр создался без ошибок типизации
      expect(typedSyncForm).toBeInstanceOf(TypedSyncForm);
    });
  });

  describe('subscribeData функционал', () => {
    it('должен создать экземпляр с опцией subscribeData', () => {
      const mockSubscribeData = jest.fn(() => {
        return jest.fn();
      });

      const syncFormWithSubscribe = new TestSyncForm(
        {
          instance: mockInstance,
          dependencies: { serverApi: mockServerApi },
          executableActions: {},
        },
        { subscribeData: mockSubscribeData },
      );

      expect(syncFormWithSubscribe).toBeInstanceOf(TestSyncForm);
    });

    it('должен вызвать subscribeData после успешного получения данных', async () => {
      const mockUnsubscribe = jest.fn();
      const mockSubscribeData = jest.fn(() => {
        return mockUnsubscribe;
      });
      const testData: ITestData = {
        state: { id: '1', name: 'subscribe test' },
        dependentData: {},
      };

      mockServerApi.getData.mockReturnValue({
        promise: Promise.resolve(testData),
        abort: mockAbort,
      });

      const syncFormWithSubscribe = new TestSyncForm(
        {
          instance: mockInstance,
          dependencies: { serverApi: mockServerApi },
          executableActions: {},
        },
        { subscribeData: mockSubscribeData },
      );

      syncFormWithSubscribe.start();

      await flushPromises();

      expect(mockSubscribeData).toHaveBeenCalledTimes(1);
      expect(mockSubscribeData).toHaveBeenCalledWith(expect.any(Function));
      expect(syncFormWithSubscribe.testUnsubscribe).toBe(mockUnsubscribe);
    });

    it('не должен вызвать subscribeData при отсутствии опции', async () => {
      const testData: ITestData = {
        state: { id: '1', name: 'no subscribe test' },
        dependentData: {},
      };

      mockServerApi.getData.mockReturnValue({
        promise: Promise.resolve(testData),
        abort: mockAbort,
      });

      syncForm.start();

      await flushPromises();

      expect(syncForm.testUnsubscribe).toBeUndefined();
    });

    it('должен вызвать unsubscribe при повторном запуске', async () => {
      const mockUnsubscribe = jest.fn();
      const mockSubscribeData = jest.fn(() => {
        return mockUnsubscribe;
      });
      const testData: ITestData = {
        state: { id: '1', name: 'unsubscribe test' },
        dependentData: {},
      };

      mockServerApi.getData.mockReturnValue({
        promise: Promise.resolve(testData),
        abort: mockAbort,
      });

      const syncFormWithSubscribe = new TestSyncForm(
        {
          instance: mockInstance,
          dependencies: { serverApi: mockServerApi },
          executableActions: {},
        },
        { subscribeData: mockSubscribeData },
      );

      syncFormWithSubscribe.start();

      await flushPromises();

      expect(mockUnsubscribe).not.toHaveBeenCalled();

      // Второй запуск должен отменить предыдущую подписку
      syncFormWithSubscribe.start();

      await flushPromises();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(2);
    });

    it('должен вызвать unsubscribe при вызове stop', async () => {
      const mockUnsubscribe = jest.fn();
      const mockSubscribeData = jest.fn(() => {
        return mockUnsubscribe;
      });
      const testData: ITestData = {
        state: { id: '1', name: 'stop test' },
        dependentData: {},
      };

      mockServerApi.getData.mockReturnValue({
        promise: Promise.resolve(testData),
        abort: mockAbort,
      });

      const syncFormWithSubscribe = new TestSyncForm(
        {
          instance: mockInstance,
          dependencies: { serverApi: mockServerApi },
          executableActions: {},
        },
        { subscribeData: mockSubscribeData },
      );

      syncFormWithSubscribe.start();

      await flushPromises();

      expect(mockUnsubscribe).not.toHaveBeenCalled();

      syncFormWithSubscribe.stop();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });

    it('не должен вызывать subscribeData при ошибке получения данных', async () => {
      const mockSubscribeData = jest.fn(() => {
        return jest.fn();
      });

      mockServerApi.getData.mockReturnValue({
        promise: Promise.reject(new Error('API Error')),
        abort: mockAbort,
      });

      const syncFormWithSubscribe = new TestSyncForm(
        {
          instance: mockInstance,
          dependencies: { serverApi: mockServerApi },
          executableActions: {},
        },
        { subscribeData: mockSubscribeData },
      );

      syncFormWithSubscribe.start();

      await flushPromises();

      expect(mockSubscribeData).not.toHaveBeenCalled();
    });
  });

  describe('методы работы с subscribeData', () => {
    describe('hasAvailableWriteFromSocket', () => {
      it('должен вернуть true, когда сохранение не в процессе', () => {
        mockInstance.isSaveInProgress = false;

        const result = syncForm.testHasAvailableWriteFromSocket();

        expect(result).toBe(true);
      });

      it('должен вернуть false, когда сохранение в процессе', () => {
        mockInstance.isSaveInProgress = true;

        const result = syncForm.testHasAvailableWriteFromSocket();

        expect(result).toBe(false);
      });
    });

    describe('writeFromSocket', () => {
      it('должен вызвать fill, когда сохранение не в процессе', () => {
        const testData: ITestData = {
          state: { id: '1', name: 'socket write' },
          dependentData: {},
        };

        mockInstance.isSaveInProgress = false;

        syncForm.testWriteFromSocket(testData);

        expect(mockInstance.fill).toHaveBeenCalledWith(testData.state, testData.dependentData);
      });

      it('не должен вызвать fill, когда сохранение в процессе', () => {
        const testData: ITestData = {
          state: { id: '1', name: 'socket write blocked' },
          dependentData: {},
        };

        mockInstance.isSaveInProgress = true;

        syncForm.testWriteFromSocket(testData);

        expect(mockInstance.fill).not.toHaveBeenCalled();
      });

      it('должен обработать несколько вызовов подряд', () => {
        const testData1: ITestData = {
          state: { id: '1', name: 'first' },
          dependentData: {},
        };
        const testData2: ITestData = {
          state: { id: '2', name: 'second' },
          dependentData: {},
        };
        const testData3: ITestData = {
          state: { id: '3', name: 'third' },
          dependentData: {},
        };

        mockInstance.isSaveInProgress = false;

        syncForm.testWriteFromSocket(testData1);
        syncForm.testWriteFromSocket(testData2);

        mockInstance.isSaveInProgress = true;
        syncForm.testWriteFromSocket(testData3);

        expect(mockInstance.fill).toHaveBeenCalledTimes(2);
        expect(mockInstance.fill).toHaveBeenCalledWith(testData1.state, testData1.dependentData);
        expect(mockInstance.fill).toHaveBeenCalledWith(testData2.state, testData2.dependentData);
        expect(mockInstance.fill).not.toHaveBeenCalledWith(
          testData3.state,
          testData3.dependentData,
        );
      });
    });
  });

  describe('интеграционные тесты с subscribeData', () => {
    it('должен корректно обработать данные из подписки', async () => {
      const testData: ITestData = { state: { id: '1', name: 'initial' }, dependentData: {} };
      const testData2: ITestData = { state: { id: '2', name: 'from socket' }, dependentData: {} };

      const mockUnsubscribe = jest.fn();
      const mockSubscribeData = jest.fn((callback: (data: ITestData) => void) => {
        callback(testData2);

        return mockUnsubscribe;
      });

      mockServerApi.getData.mockReturnValue({
        promise: Promise.resolve(testData),
        abort: mockAbort,
      });

      const syncFormWithSubscribe = new TestSyncForm(
        {
          instance: mockInstance,
          dependencies: { serverApi: mockServerApi },
          executableActions: {},
        },
        { subscribeData: mockSubscribeData },
      );

      syncFormWithSubscribe.start();

      await flushPromises();

      // Проверяем первоначальную загрузку данных
      expect(mockInstance.fill).toHaveBeenCalledWith(testData.state, testData.dependentData);

      await flushPromises();

      // Проверяем данные из подписки
      expect(mockInstance.fill).toHaveBeenCalledWith(testData2.state, testData2.dependentData);
      expect(mockInstance.fill).toHaveBeenCalledTimes(2);
    });

    it('должен игнорировать данные из подписки во время сохранения', async () => {
      let subscribeCallback: ((data: ITestData) => void) | undefined;
      const mockUnsubscribe = jest.fn();
      const mockSubscribeData = jest.fn((callback: (data: ITestData) => void) => {
        subscribeCallback = callback;

        return mockUnsubscribe;
      });

      const testData: ITestData = { state: { id: '1', name: 'initial' }, dependentData: {} };
      const testData2: ITestData = { state: { id: '2', name: 'blocked' }, dependentData: {} };
      const testData3: ITestData = { state: { id: '3', name: 'allowed' }, dependentData: {} };

      mockServerApi.getData.mockReturnValue({
        promise: Promise.resolve(testData),
        abort: mockAbort,
      });

      const syncFormWithSubscribe = new TestSyncForm(
        {
          instance: mockInstance,
          dependencies: { serverApi: mockServerApi },
          executableActions: {},
        },
        { subscribeData: mockSubscribeData },
      );

      syncFormWithSubscribe.start();

      await flushPromises();

      expect(mockInstance.fill).toHaveBeenCalledTimes(1);
      expect(subscribeCallback).toBeDefined();

      // Устанавливаем флаг сохранения
      mockInstance.isSaveInProgress = true;

      // Имитируем получение данных из подписки во время сохранения
      subscribeCallback?.(testData2);

      // Данные не должны быть записаны
      expect(mockInstance.fill).toHaveBeenCalledTimes(1);

      // Снимаем флаг сохранения
      mockInstance.isSaveInProgress = false;

      // Имитируем получение данных из подписки после сохранения
      subscribeCallback?.(testData3);

      // Теперь данные должны быть записаны
      expect(mockInstance.fill).toHaveBeenCalledTimes(2);
      expect(mockInstance.fill).toHaveBeenLastCalledWith(testData3.state, testData3.dependentData);
    });

    it('должен правильно обработать несколько циклов подписки/отписки', async () => {
      const mockUnsubscribe1 = jest.fn();
      const mockUnsubscribe2 = jest.fn();
      let callCount = 0;
      const mockSubscribeData = jest.fn(() => {
        callCount += 1;

        return callCount === 1 ? mockUnsubscribe1 : mockUnsubscribe2;
      });

      const testData: ITestData = { state: { id: '1', name: 'test' }, dependentData: {} };

      mockServerApi.getData.mockReturnValue({
        promise: Promise.resolve(testData),
        abort: mockAbort,
      });

      const syncFormWithSubscribe = new TestSyncForm(
        {
          instance: mockInstance,
          dependencies: { serverApi: mockServerApi },
          executableActions: {},
        },
        { subscribeData: mockSubscribeData },
      );

      // Первый цикл
      syncFormWithSubscribe.start();
      await flushPromises();

      expect(mockSubscribeData).toHaveBeenCalledTimes(1);
      expect(mockUnsubscribe1).not.toHaveBeenCalled();

      // Второй цикл
      syncFormWithSubscribe.start();
      await flushPromises();

      expect(mockSubscribeData).toHaveBeenCalledTimes(2);
      expect(mockUnsubscribe1).toHaveBeenCalledTimes(2);
      expect(mockUnsubscribe2).not.toHaveBeenCalled();

      // Остановка
      syncFormWithSubscribe.stop();

      expect(mockUnsubscribe2).toHaveBeenCalledTimes(1);
    });
  });

  describe('граничные случаи', () => {
    it('должен обрабатывать случай, когда serverApi.getData возвращает undefined данные: переход в состояние ошибки', async () => {
      mockServerApi.getData.mockReturnValue({
        promise: Promise.resolve(undefined as unknown as ITestData),
        abort: jest.fn(),
      });

      syncForm.start();

      await flushPromises();

      expect(mockDebugFunction).toHaveBeenCalledWith('error:', expect.any(Error));
      expect(mockInstance.setSyncError).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать случай с пустыми данными', async () => {
      const emptyData = { state: { id: '', name: '' }, dependentData: {} };

      mockServerApi.getData.mockReturnValue({
        promise: Promise.resolve(emptyData),
        abort: jest.fn(),
      });

      syncForm.start();

      await flushPromises();

      expect(mockInstance.fill).toHaveBeenCalledWith(emptyData.state, emptyData.dependentData);
    });
  });
});
