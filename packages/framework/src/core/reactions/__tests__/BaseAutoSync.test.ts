/// <reference types="jest" />
import { observable, when } from 'mobx';

import { BaseAutoSync } from '../BaseAutoSync';

import type { IAutoSyncInstance, IServerApi } from '../BaseAutoSync';

// Мокаем модуль целиком
jest.mock('@experiments/timeout-requester', () => {
  // Создаем моки внутри фабричной функции
  const mockRequest = jest.fn().mockImplementation((request: () => void, time: number) => {
    setTimeout(request, time);
  });
  const mockCancelRequest = jest.fn();

  // Создаем объект с моками
  const mockTimeoutRequester = {
    request: mockRequest,
    cancelRequest: mockCancelRequest,
  };

  return {
    SetTimeoutRequest: jest.fn(() => {
      return mockTimeoutRequester;
    }),
    timeoutRequester: mockTimeoutRequester,
  };
});

// Получаем доступ к замоканному модулю
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { timeoutRequester } = jest.requireMock('@experiments/timeout-requester');

// Мокаем логгер
jest.mock('@/utils/logger', () => {
  return {
    debugResolve: jest.fn().mockReturnValue(jest.fn()),
  };
});

interface ITestData {
  state: {
    test?: string;
    prepared?: string;
  };
  dependentData: Record<string, unknown>;
}

// Конкретная реализация BaseAutoSync для тестирования
class TestAutoSync extends BaseAutoSync<ITestData> {
  // Реализация абстрактного класса не требует дополнительных методов,
  // так как все необходимые методы уже реализованы в базовом классе
  public callWriteFromSocket(data: ITestData): void {
    this.writeFromSocket(data);
  }
}

const state = observable.object({
  isSaveInProgress: false,
  isSyncRetry: false,
  isSyncError: false,
});

describe('Базовый класс автоматической синхронизации', () => {
  let instance: IAutoSyncInstance<ITestData>;
  let serverApi: IServerApi<ITestData>;
  let mockAbort: jest.Mock;

  beforeEach(() => {
    // Сбрасываем моки перед каждым тестом
    jest.clearAllMocks();

    // Создаем мок для instance
    instance = {
      setSyncInProgress: jest.fn(),
      setSyncError: jest.fn().mockImplementation(() => {
        state.isSyncError = true;
      }),
      setSyncRetry: jest.fn().mockImplementation(() => {
        state.isSyncRetry = true;
      }),
      ...state,
      fill: jest.fn(),
    };

    // Создаем мок для abort функции
    mockAbort = jest.fn();

    // Создаем мок для serverApi с использованием jest.fn()
    serverApi = {
      getData: jest.fn(() => {
        return {
          promise: Promise.resolve({ state: {}, dependentData: {} }),
          abort: mockAbort,
        };
      }),
    };
  });

  describe('Инициализация синхронизации', () => {
    it('должен инициировать процесс синхронизации и установить соответствующее состояние', () => {
      const autoSync = new TestAutoSync({
        instance,
        dependencies: { serverApi },
        executableActions: {},
      });

      autoSync.start();

      expect(instance.setSyncInProgress).toHaveBeenCalled();
      expect(serverApi.getData).toHaveBeenCalled();
    });

    it('должен корректно отменять предыдущую подписку при повторной синхронизации', async () => {
      const mockUnsubscribe = jest.fn();

      const subscribeData = jest.fn().mockReturnValue(mockUnsubscribe);

      const autoSync = new TestAutoSync(
        {
          instance,
          dependencies: { serverApi },
          executableActions: {},
        },
        { subscribeData },
      );

      // Первый вызов defineSync
      autoSync.start();

      // Успешный ответ от сервера
      await serverApi.getData().promise;
      expect(subscribeData).toHaveBeenCalled();

      // Второй вызов defineSync
      autoSync.start();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('должен предоставить функцию очистки для отмены запроса и отписки', () => {
      const autoSync = new TestAutoSync({
        instance,
        dependencies: { serverApi },
        executableActions: {},
      });

      autoSync.start();
      autoSync.stop();

      expect(mockAbort).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(timeoutRequester.cancelRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('Обработка повторных попыток синхронизации', () => {
    it('должен успешно заполнить данные при получении ответа от сервера', async () => {
      const testData = {
        state: { test: 'data' },
        dependentData: {},
      };

      jest.spyOn(serverApi, 'getData').mockImplementation(() => {
        return {
          promise: Promise.resolve(testData),
          abort: mockAbort,
        };
      });

      const autoSync = new TestAutoSync({
        instance,
        dependencies: { serverApi },
        executableActions: {},
      });

      autoSync.start();

      await serverApi.getData().promise;

      expect(instance.fill).toHaveBeenCalledWith(testData.state, testData.dependentData);
    });

    it('должен инициировать повторную попытку при возникновении ошибки', async () => {
      jest.spyOn(serverApi, 'getData').mockImplementation(() => {
        return {
          promise: Promise.reject(new Error('test error')),
          abort: mockAbort,
        };
      });

      const autoSync = new TestAutoSync({
        instance,
        dependencies: { serverApi },
        executableActions: {},
      });

      autoSync.start();

      await expect(serverApi.getData().promise).rejects.toThrow();

      expect(instance.setSyncRetry).toHaveBeenCalled();
    });

    it('должен прекратить попытки и установить ошибку после исчерпания лимита повторов', async () => {
      const customInterval = 10;

      jest.spyOn(serverApi, 'getData').mockImplementation(() => {
        return {
          promise: Promise.reject(new Error('test error')),
          abort: mockAbort,
        };
      });

      const autoSync = new TestAutoSync(
        {
          instance,
          dependencies: { serverApi },
          executableActions: {},
        },
        { requestInterval: customInterval },
      );

      autoSync.start();

      await when(() => {
        return state.isSyncError;
      });

      expect(instance.setSyncError).toHaveBeenCalledTimes(1);
    });

    it('должен соблюдать пользовательский интервал между попытками синхронизации', async () => {
      const customInterval = 100;

      state.isSyncRetry = true;

      jest.spyOn(serverApi, 'getData').mockImplementation(() => {
        return {
          promise: Promise.reject(new Error('test error')),
          abort: mockAbort,
        };
      });

      const autoSync = new TestAutoSync(
        {
          instance,
          dependencies: { serverApi },
          executableActions: {},
        },
        { requestInterval: customInterval },
      );

      autoSync.start();

      await when(() => {
        return state.isSyncError;
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(timeoutRequester.request).toHaveBeenCalledWith(expect.any(Function), customInterval);
    });
  });

  describe('Обработка данных из сокета', () => {
    it('должен сохранить данные, если нет активного сохранения', () => {
      const testData = {
        state: { test: 'socket-data' },
        dependentData: { extra: 'info' },
      };

      instance.isSaveInProgress = false;

      const autoSync = new TestAutoSync({
        instance,
        dependencies: { serverApi },
        executableActions: {},
      });

      autoSync.callWriteFromSocket(testData);

      expect(instance.fill).toHaveBeenCalledWith(testData.state, testData.dependentData);
    });

    it('не должен сохранять данные, если есть активное сохранение', () => {
      const testData = {
        state: { test: 'socket-data' },
        dependentData: { extra: 'info' },
      };

      instance.isSaveInProgress = true;

      const autoSync = new TestAutoSync({
        instance,
        dependencies: { serverApi },
        executableActions: {},
      });

      autoSync.callWriteFromSocket(testData);

      expect(instance.fill).not.toHaveBeenCalled();
    });
  });
});
