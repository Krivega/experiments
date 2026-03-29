/// <reference types="jest" />
/* eslint-disable max-classes-per-file */
import { BaseAction } from '../BaseAction';

import type { Instance } from 'mobx-state-tree';
import type { ICoreApiAction, IServerApiAction, TBaseInstance } from '../types';

// Типы для тестирования
interface ITestActionParams {
  id: string;
  value: number;
}

interface ITestActionResult {
  name: string;
  title: string;
}

type TTestInstance = TBaseInstance & {
  isChildClassValid: boolean;
};

const onHandleSuccessAction = jest.fn();

// Конкретная реализация BaseAction для тестирования
class TestAction extends BaseAction<ITestActionParams, ITestActionResult, TTestInstance> {
  // Публичные геттеры для тестирования защищенных свойств
  public get testInstance() {
    return this.instance;
  }

  public get testServerApi() {
    return this.dependencies.serverApi;
  }

  public get testCoreApi() {
    return this.dependencies.coreApi;
  }

  // Публичные методы для тестирования защищенных методов
  public testBeforeRun(): void {
    this.beforeRun();
  }

  public testRun(params: ITestActionParams) {
    return this.run(params);
  }

  public testHandleSuccess(): void {
    this.handleSuccessAction({ name: 'name', title: 'title' });
  }

  public testHandleFinallyAction(): void {
    this.handleFinallyAction();
  }

  public testHandleError(error: unknown): void {
    this.handleErrorAction(error);
  }

  protected handleSuccessAction(data: ITestActionResult): void {
    super.handleSuccessAction(data);

    onHandleSuccessAction(data);
  }

  protected initValidator(): void {
    super.initValidator();

    this.validator?.addValidator(() => {
      return this.instance.isChildClassValid;
    });
  }
}

// Создание моков
const createMockInstance = (): jest.Mocked<Instance<TTestInstance>> => {
  return {
    startAction: jest.fn(),
    endAction: jest.fn(),
    isActionInProgress: false,
    isChildClassValid: true,
  };
};

const createMockServerApi = (
  shouldSucceed = true,
): jest.Mocked<IServerApiAction<ITestActionParams, ITestActionResult>> => {
  const mockAbort = jest.fn();
  const mockPromise = shouldSucceed
    ? Promise.resolve({ name: 'name', title: 'title' })
    : Promise.reject(new Error('API Action Error'));

  return {
    hasAbortedError: jest.fn().mockImplementation(() => {
      return false;
    }),
    request: jest.fn().mockImplementation(() => {
      return {
        promise: mockPromise,
        abort: mockAbort,
      };
    }),
  };
};

const createMockCoreApi = (): jest.Mocked<
  ICoreApiAction & { hideAllNotifications: () => void }
> => {
  return {
    hideAllNotifications: jest.fn(),
    showSuccessAction: jest.fn(),
    showErrorAction: jest.fn(),
  };
};

describe('BaseAction', () => {
  let mockInstance: jest.Mocked<Instance<TTestInstance>>;
  let mockServerApi: jest.Mocked<IServerApiAction<ITestActionParams, ITestActionResult>>;
  let mockCoreApi: jest.Mocked<ICoreApiAction & { hideAllNotifications: () => void }>;
  let testAction: TestAction;
  const onSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockInstance = createMockInstance();
    mockServerApi = createMockServerApi();
    mockCoreApi = createMockCoreApi();

    testAction = new TestAction({
      instance: mockInstance,
      dependencies: { serverApi: mockServerApi, coreApi: mockCoreApi },
    });
  });

  describe('конструктор', () => {
    it('должен правильно инициализировать экземпляр с переданными зависимостями', () => {
      expect(testAction.testInstance).toBe(mockInstance);
      expect(testAction.testServerApi).toBe(mockServerApi);
      expect(testAction.testCoreApi).toBe(mockCoreApi);
    });
  });

  describe('метод execute', () => {
    const testParams: ITestActionParams = { id: 'test-id', value: 42 };

    describe('успешный сценарий', () => {
      it('должен вызвать handleStart при запуске', () => {
        testAction.execute(testParams);

        expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
        expect(mockInstance.startAction).toHaveBeenCalledTimes(1);
      });

      it('должен скрыть уведомления и начать действие', () => {
        testAction.execute(testParams);

        expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
        expect(mockInstance.startAction).toHaveBeenCalledTimes(1);
      });

      it('должен вызвать серверное API с переданными параметрами', () => {
        testAction.execute(testParams);

        expect(mockServerApi.request).toHaveBeenCalledTimes(1);
        expect(mockServerApi.request).toHaveBeenCalledWith(testParams);
      });

      it('должен вернуть функцию отмены операции', () => {
        const mockAbort = jest.fn();

        (mockServerApi.request as jest.Mock).mockReturnValue({
          promise: Promise.resolve(),
          abort: mockAbort,
        });

        testAction.execute(testParams);

        // @ts-expect-error
        expect(testAction.abortPromise).toBe(mockAbort);

        testAction.cancel();

        expect(mockAbort).toHaveBeenCalledTimes(1);
      });

      it('должен вызвать handleSuccess при успешном выполнении', async () => {
        mockServerApi = createMockServerApi(true);

        testAction = new TestAction({
          instance: mockInstance,
          dependencies: { serverApi: mockServerApi, coreApi: mockCoreApi },
        });

        testAction.execute(testParams);

        await new Promise((resolve) => {
          setTimeout(resolve, 0);
        });

        expect(mockCoreApi.showSuccessAction).toHaveBeenCalledTimes(1);
        expect(mockInstance.endAction).toHaveBeenCalledTimes(1);
      });
    });

    describe('сценарий с ошибкой', () => {
      it('должен вызвать handleError при ошибке выполнения', async () => {
        mockServerApi = createMockServerApi(false);

        testAction = new TestAction({
          instance: mockInstance,
          dependencies: { serverApi: mockServerApi, coreApi: mockCoreApi },
        });

        testAction.execute(testParams);

        await new Promise((resolve) => {
          setTimeout(resolve, 0);
        });

        expect(mockCoreApi.showErrorAction).toHaveBeenCalledTimes(1);
        expect(mockInstance.endAction).toHaveBeenCalledTimes(1);
      });

      it('должен не показывать ошибку если запрос был отменен', async () => {
        const testError = new Error('Aborted');

        mockServerApi.hasAbortedError.mockReturnValue(true);
        (mockServerApi.request as jest.Mock).mockReturnValue({
          promise: Promise.reject(testError),
          abort: jest.fn(),
        });

        testAction.execute(testParams);

        await new Promise((resolve) => {
          setTimeout(resolve, 0);
        });

        expect(mockServerApi.hasAbortedError).toHaveBeenCalledWith(testError);
        expect(mockCoreApi.showErrorAction).not.toHaveBeenCalled();
        expect(mockInstance.endAction).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('метод run', () => {
    const testParams: ITestActionParams = { id: 'test-id', value: 42 };

    it('должен вернуть объект с функциями abort и promise', () => {
      const { abort, promise } = testAction.testRun(testParams);

      expect(abort).toEqual(expect.any(Function));
      expect(promise).toBeInstanceOf(Promise);
    });

    it('должен вызвать serverApi.request с переданными параметрами', () => {
      testAction.testRun(testParams);

      expect(mockServerApi.request).toHaveBeenCalledWith(testParams);
    });

    it('должен вернуть результат вызова serverApi.request', () => {
      const mockResult = {
        promise: Promise.resolve(),
        abort: jest.fn(),
      };

      (mockServerApi.request as jest.Mock).mockReturnValue(mockResult);

      const result = testAction.testRun(testParams);

      expect(result).toBe(mockResult);
    });
  });

  describe('метод beforeRun', () => {
    it('должен скрыть все уведомления', () => {
      testAction.testBeforeRun();

      expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
    });

    it('должен начать действие', () => {
      testAction.testBeforeRun();

      expect(mockInstance.startAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('метод handleSuccess', () => {
    it('должен показать уведомление об успешном выполнении', () => {
      testAction.testHandleSuccess();

      expect(mockCoreApi.showSuccessAction).toHaveBeenCalledTimes(1);
    });

    it('не должен показывать уведомление об успешном выполнении, если оно не определено', () => {
      mockCoreApi.showSuccessAction = undefined;

      testAction = new TestAction({
        instance: mockInstance,
        dependencies: { serverApi: mockServerApi, coreApi: mockCoreApi },
      });

      testAction.testHandleSuccess();

      expect(mockCoreApi.showSuccessAction).toBeUndefined();
    });

    it('должен получать данные для handleSuccessAction', () => {
      testAction.testHandleSuccess();

      expect(onHandleSuccessAction).toHaveBeenCalledWith({ name: 'name', title: 'title' });
    });
  });

  describe('метод handleError', () => {
    it('должен показать уведомление об ошибке если запрос не был отменен', () => {
      const testError = new Error('Action failed');

      mockServerApi.hasAbortedError.mockReturnValue(false);

      testAction.testHandleError(testError);

      expect(mockServerApi.hasAbortedError).toHaveBeenCalledWith(testError);
      expect(mockCoreApi.showErrorAction).toHaveBeenCalledTimes(1);
    });

    it('должен не показывать уведомление об ошибке если запрос был отменен', () => {
      const testError = new Error('Aborted');

      mockServerApi.hasAbortedError.mockReturnValue(true);

      testAction.testHandleError(testError);

      expect(mockServerApi.hasAbortedError).toHaveBeenCalledWith(testError);
      expect(mockCoreApi.showErrorAction).not.toHaveBeenCalled();
    });
  });

  describe('метод handleFinallyAction', () => {
    it('должен завершить действие', () => {
      testAction.testHandleFinallyAction();

      expect(mockInstance.endAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('интеграционные тесты', () => {
    const testParams: ITestActionParams = { id: 'integration-test', value: 42 };

    it('должен корректно выполнить полный цикл успешного действия', async () => {
      mockServerApi = createMockServerApi(true);

      testAction = new TestAction({
        instance: mockInstance,
        dependencies: { serverApi: mockServerApi, coreApi: mockCoreApi },
      });

      testAction.execute(testParams);

      // Проверяем начальное состояние
      expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
      expect(mockInstance.startAction).toHaveBeenCalledTimes(1);
      expect(mockServerApi.request).toHaveBeenCalledTimes(1);

      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });

      // Проверяем финальное состояние
      expect(mockCoreApi.showSuccessAction).toHaveBeenCalledTimes(1);
      expect(mockInstance.endAction).toHaveBeenCalledTimes(1);
    });

    it('должен корректно выполнить полный цикл действия с ошибкой', async () => {
      mockServerApi = createMockServerApi(false);

      testAction = new TestAction({
        instance: mockInstance,
        dependencies: { serverApi: mockServerApi, coreApi: mockCoreApi },
      });

      testAction.execute(testParams);

      // Проверяем начальное состояние
      expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
      expect(mockInstance.startAction).toHaveBeenCalledTimes(1);
      expect(mockServerApi.request).toHaveBeenCalledTimes(1);

      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });

      // Проверяем финальное состояние
      expect(mockInstance.endAction).toHaveBeenCalledTimes(1);
      expect(mockCoreApi.showErrorAction).toHaveBeenCalledTimes(1);
    });

    it('должен работать с множественными вызовами action', async () => {
      mockServerApi = createMockServerApi(true);

      testAction = new TestAction({
        instance: mockInstance,
        dependencies: { serverApi: mockServerApi, coreApi: mockCoreApi },
      });

      // Выполняем несколько вызовов
      testAction.execute(testParams);
      testAction.execute(testParams);
      testAction.execute(testParams);

      expect(mockInstance.startAction).toHaveBeenCalledTimes(3);
      expect(mockServerApi.request).toHaveBeenCalledTimes(3);

      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      expect(mockInstance.endAction).toHaveBeenCalledTimes(3);
      expect(mockCoreApi.showSuccessAction).toHaveBeenCalledTimes(3);
    });

    it('должен вызвать onSuccess при успешном запросе', async () => {
      const result = { id: '1' };
      const mockAbort = jest.fn();

      (mockServerApi.request as jest.Mock).mockReturnValue({
        promise: Promise.resolve(result),
        abort: mockAbort,
      });

      testAction.execute(testParams, { onSuccess });

      // Ждем завершения Promise
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith(result);
    });
  });

  describe('тестирование типизации', () => {
    it('должен корректно работать с типизированными параметрами', () => {
      const testParams: ITestActionParams = {
        id: 'typed-test',
        value: 999,
      };

      const runSpy = jest.spyOn(testAction, 'run');
      // @ts-expect-error - доступ к protected методу
      const beforeRunSpy = jest.spyOn(testAction, 'beforeRun');

      testAction.execute(testParams);

      expect(beforeRunSpy).toHaveBeenCalledWith(testParams);
      expect(runSpy).toHaveBeenCalledWith(testParams);
      expect(mockServerApi.request).toHaveBeenCalledWith(expect.objectContaining(testParams));
    });

    it('должен поддерживать различные типы для TRequestParams', () => {
      interface ISimpleActionParams {
        value: string;
      }

      class TypedAction extends BaseAction<ISimpleActionParams> {}

      const typedServerApi: IServerApiAction<ISimpleActionParams, unknown> = {
        hasAbortedError: jest.fn().mockImplementation(() => {
          return false;
        }),
        request: jest.fn().mockImplementation(() => {
          return {
            promise: Promise.resolve(),
            abort: jest.fn(),
          };
        }),
      };

      const typedCoreApi: ICoreApiAction & { hideAllNotifications: () => void } = {
        hideAllNotifications: jest.fn(),
        showSuccessAction: jest.fn(),
        showErrorAction: jest.fn(),
      };

      const typedAction = new TypedAction({
        instance: mockInstance,
        dependencies: { serverApi: typedServerApi, coreApi: typedCoreApi },
      });

      expect(typedAction).toBeInstanceOf(TypedAction);
    });
  });

  describe('граничные случаи', () => {
    const testParams: ITestActionParams = { id: 'edge-case', value: 42 };

    it('должен обрабатывать случай, когда abort функция не определена', () => {
      (mockServerApi.request as jest.Mock).mockReturnValue({
        promise: Promise.resolve(),
        abort: undefined as unknown as () => void,
      });

      testAction.execute(testParams);

      // @ts-expect-error
      expect(testAction.abortPromise).toBeUndefined();
    });

    it('должен корректно работать при повторном вызове методов', () => {
      // Проверяем идемпотентность методов
      testAction.testBeforeRun();
      testAction.testBeforeRun();
      testAction.testBeforeRun();

      expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(3);
      expect(mockInstance.startAction).toHaveBeenCalledTimes(3);

      testAction.testHandleSuccess();
      testAction.testHandleSuccess();

      expect(mockCoreApi.showSuccessAction).toHaveBeenCalledTimes(2);

      testAction.testHandleError(new Error('Test error'));
      testAction.testHandleError(new Error('Test error'));

      expect(mockCoreApi.showErrorAction).toHaveBeenCalledTimes(2);

      testAction.testHandleFinallyAction();
      testAction.testHandleFinallyAction();

      expect(mockInstance.endAction).toHaveBeenCalledTimes(2);
    });
  });

  describe('валидация execute', () => {
    it('должен проверять, что действие не находится в процессе выполнения', () => {
      mockInstance.isActionInProgress = true;

      expect(testAction.canExecute({ id: 'test', value: 1 })).toBe(false);

      mockInstance.isActionInProgress = false;

      expect(testAction.canExecute({ id: 'test', value: 1 })).toBe(true);
    });

    it('должен учитывать валидаторы дочерних классов', () => {
      expect(testAction.canExecute({ id: 'test', value: 1 })).toBe(true);

      mockInstance.isChildClassValid = false;

      expect(testAction.canExecute({ id: 'test', value: 1 })).toBe(false);
    });
  });
});
