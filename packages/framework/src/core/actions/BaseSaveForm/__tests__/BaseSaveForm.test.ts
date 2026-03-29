/// <reference types="jest" />
/* eslint-disable max-classes-per-file */
import { flushPromises } from '@experiments/test-utils';

import { BaseSaveForm } from '../BaseSaveForm';

import type { Instance } from 'mobx-state-tree';
import type { ICoreApiSave, IServerApiSave, TBaseInstance } from '../types';

// Типы для тестирования
interface ITestSaveData {
  id: string;
  name: string;
  value: number;
}

type TTestModel = TBaseInstance<ITestSaveData> & {
  isChildClassValid: boolean;
};

// Конкретная реализация BaseSaveForm для тестирования
class TestSaveForm extends BaseSaveForm<ITestSaveData, void, TTestModel> {
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

  public get testDebug() {
    return this.debug;
  }

  // Публичные методы для тестирования защищенных методов
  public testBeforeRun(): void {
    this.beforeRun();
  }

  public testHandleSuccessAction(): void {
    this.handleSuccessAction();
  }

  public testHandleErrorAction(error: unknown): void {
    this.handleErrorAction(error);
  }

  public testGetSaveData(): ITestSaveData {
    return this.getSaveData();
  }

  public testCallServerApi(data: ITestSaveData): { promise: Promise<void>; abort: () => void } {
    return this.callServerApi(data);
  }

  protected initValidator(): void {
    super.initValidator();

    this.validator?.addValidator(() => {
      return this.instance.isChildClassValid;
    });
  }
}

// Создание моков
const createMockInstance = () => {
  return {
    isChildClassValid: true,
    canSave: jest.fn().mockReturnValue(true),
    setSaveInProgress: jest.fn(),
    setSaveError: jest.fn(),
    rememberState: jest.fn(),
    fields: {
      currentState: {
        id: 'test-id',
        name: 'test-name',
        value: 42,
      } as ITestSaveData,
    },
  };
};

const mockResponse = 'response';

const createMockServerApi = (shouldSucceed = true): jest.Mocked<IServerApiSave<ITestSaveData>> => {
  const mockAbort = jest.fn();
  const mockPromise = shouldSucceed
    ? Promise.resolve(mockResponse)
    : Promise.reject(new Error('API Save Error'));

  return {
    hasAbortedError: jest.fn().mockImplementation(() => {
      return false;
    }),
    setData: jest.fn().mockImplementation(() => {
      return {
        promise: mockPromise,
        abort: mockAbort,
      };
    }),
  };
};

const createMockCoreApi = (): jest.Mocked<ICoreApiSave> => {
  return {
    hideAllNotifications: jest.fn(),
    showSuccessSavingForm: jest.fn(),
    showFailedToSaveFormError: jest.fn(),
  };
};

describe('BaseSaveForm', () => {
  let mockInstance: ReturnType<typeof createMockInstance>;
  let mockServerApi: jest.Mocked<IServerApiSave<ITestSaveData>>;
  let mockCoreApi: jest.Mocked<ICoreApiSave>;
  let saveForm: TestSaveForm;
  const onSuccess = jest.fn(() => {});

  beforeEach(() => {
    mockInstance = createMockInstance();
    mockServerApi = createMockServerApi();
    mockCoreApi = createMockCoreApi();

    const dependencies = {
      coreApi: mockCoreApi,
      serverApi: mockServerApi,
    };

    saveForm = new TestSaveForm({
      dependencies,
      instance: mockInstance as unknown as Instance<TTestModel>,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('конструктор', () => {
    it('должен правильно инициализировать экземпляр с переданными зависимостями', () => {
      expect(saveForm.testInstance).toBe(mockInstance);
      expect(saveForm.testServerApi).toBe(mockServerApi);
      expect(saveForm.testCoreApi).toBe(mockCoreApi);
    });
  });

  describe('метод execute', () => {
    describe('успешный сценарий', () => {
      it('должен вызвать handleStart при запуске', () => {
        // Проверяем эффекты handleStart вместо прямого spy
        saveForm.execute(undefined);

        expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
        expect(mockInstance.setSaveInProgress).toHaveBeenCalledTimes(1);
      });

      it('должен скрыть уведомления и установить состояние сохранения', () => {
        saveForm.execute(undefined);

        expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
        expect(mockInstance.setSaveInProgress).toHaveBeenCalledTimes(1);
      });

      it('должен получить данные через getSaveData', () => {
        // Проверяем эффекты getSaveData - вызов serverApi с правильными данными
        saveForm.execute(undefined);

        expect(mockServerApi.setData).toHaveBeenCalledTimes(1);
        expect(mockServerApi.setData).toHaveBeenCalledWith({
          id: 'test-id',
          name: 'test-name',
          value: 42,
        });
      });

      it('должен вызвать серверное API с полученными данными', () => {
        saveForm.execute(undefined);

        expect(mockServerApi.setData).toHaveBeenCalledTimes(1);
        expect(mockServerApi.setData).toHaveBeenCalledWith({
          id: 'test-id',
          name: 'test-name',
          value: 42,
        });
      });

      it('должен вызвать функцию отмены операции если вызвать cancel', () => {
        const mockAbort = jest.fn();

        mockServerApi.setData.mockReturnValue({
          promise: Promise.resolve(),
          abort: mockAbort,
        });

        saveForm.execute(undefined);
        saveForm.cancel();

        expect(mockAbort).toHaveBeenCalledTimes(1);
      });

      it('должен вызвать handleSuccessAction при успешном сохранении', async () => {
        mockServerApi = createMockServerApi(true);

        const dependencies = {
          coreApi: mockCoreApi,
          serverApi: mockServerApi,
        };

        saveForm = new TestSaveForm({
          dependencies,
          instance: mockInstance as unknown as Instance<TTestModel>,
        });

        saveForm.execute(undefined);

        // Ждем завершения Promise
        await flushPromises();

        expect(mockCoreApi.showSuccessSavingForm).toHaveBeenCalledTimes(1);
        expect(mockInstance.rememberState).toHaveBeenCalledTimes(1);
      });

      it('должен запустить процесс сохранения', () => {
        const runSpy = jest.spyOn(saveForm, 'run');

        saveForm.execute(undefined);

        expect(runSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('сценарий с ошибкой', () => {
      it('должен вызвать handleErrorAction при ошибке сохранения', async () => {
        mockServerApi = createMockServerApi(false);

        const dependencies = {
          coreApi: mockCoreApi,
          serverApi: mockServerApi,
        };

        saveForm = new TestSaveForm({
          dependencies,
          instance: mockInstance as unknown as Instance<TTestModel>,
        });

        saveForm.execute(undefined);

        // Ждем завершения Promise
        await flushPromises();

        expect(mockCoreApi.showFailedToSaveFormError).toHaveBeenCalledTimes(1);
        expect(mockInstance.setSaveError).toHaveBeenCalledTimes(1);
      });

      it('должен не показывать ошибку если запрос был отменен', async () => {
        const testError = new Error('Aborted');

        mockServerApi.hasAbortedError.mockReturnValue(true);
        mockServerApi.setData.mockReturnValue({
          promise: Promise.reject(testError),
          abort: jest.fn(),
        });

        saveForm.execute(undefined);

        await flushPromises();

        expect(mockServerApi.hasAbortedError).toHaveBeenCalledWith(testError);
        expect(mockCoreApi.showFailedToSaveFormError).not.toHaveBeenCalled();
        expect(mockInstance.setSaveError).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('метод getSaveData', () => {
    it('должен возвращать данные из instance.fields.currentState', () => {
      const result = saveForm.testGetSaveData();

      expect(result).toEqual({
        id: 'test-id',
        name: 'test-name',
        value: 42,
      });
    });

    it('должен работать с различными типами данных в currentState', () => {
      const testCases = [
        { id: '1', name: 'test1', value: 100 },
        { id: '2', name: 'test with special chars áéíóú', value: 0 },
        { id: '', name: '', value: -1 },
        { id: 'complex', name: 'complex test', value: 999.99 },
      ];

      testCases.forEach((testData) => {
        mockInstance.fields.currentState = testData;

        const result = saveForm.testGetSaveData();

        expect(result).toEqual(testData);
      });
    });
  });

  describe('метод callServerApi', () => {
    it('должен вызвать serverApi.setData с переданными данными', () => {
      const testData: ITestSaveData = { id: 'call-test', name: 'Call API Test', value: 123 };

      saveForm.testCallServerApi(testData);

      expect(mockServerApi.setData).toHaveBeenCalledWith(testData);
    });

    it('должен вернуть результат вызова serverApi.setData', () => {
      const mockResult = {
        promise: Promise.resolve(),
        abort: jest.fn(),
      };

      mockServerApi.setData.mockReturnValue(mockResult);

      const result = saveForm.testCallServerApi({ id: 'test', name: 'test', value: 1 });

      expect(result).toBe(mockResult);
    });
  });

  describe('метод handleStart', () => {
    it('должен скрыть все уведомления', () => {
      saveForm.testBeforeRun();

      expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
    });

    it('должен установить состояние "сохранение в процессе"', () => {
      saveForm.testBeforeRun();

      expect(mockInstance.setSaveInProgress).toHaveBeenCalledTimes(1);
    });
  });

  describe('метод handleSuccess', () => {
    it('должен показать уведомление об успешном сохранении', () => {
      saveForm.testHandleSuccessAction();

      expect(mockCoreApi.showSuccessSavingForm).toHaveBeenCalledTimes(1);
    });

    it('должен запомнить состояние формы', () => {
      saveForm.testHandleSuccessAction();

      expect(mockInstance.rememberState).toHaveBeenCalledTimes(1);
    });
  });

  describe('метод handleError', () => {
    it('должен показать уведомление об ошибке если запрос не был отменен', () => {
      const testError = new Error('Save failed');

      mockServerApi.hasAbortedError.mockReturnValue(false);

      saveForm.testHandleErrorAction(testError);

      expect(mockServerApi.hasAbortedError).toHaveBeenCalledWith(testError);
      expect(mockCoreApi.showFailedToSaveFormError).toHaveBeenCalledTimes(1);
    });

    it('должен не показывать уведомление об ошибке если запрос был отменен', () => {
      const testError = new Error('Aborted');

      mockServerApi.hasAbortedError.mockReturnValue(true);

      saveForm.testHandleErrorAction(testError);

      expect(mockServerApi.hasAbortedError).toHaveBeenCalledWith(testError);
      expect(mockCoreApi.showFailedToSaveFormError).not.toHaveBeenCalled();
    });

    it('должен установить состояние ошибки сохранения', () => {
      const testError = new Error('Test error');

      saveForm.testHandleErrorAction(testError);

      expect(mockInstance.setSaveError).toHaveBeenCalledTimes(1);
    });

    it('должен корректно обрабатывать различные типы ошибок', () => {
      const errorCases = [
        new Error('Standard error'),
        'String error message',
        { code: 500, message: 'Server error' },
        42, // number
        true, // boolean
        undefined,
        undefined,
      ];

      errorCases.forEach((error) => {
        jest.clearAllMocks();

        saveForm.testHandleErrorAction(error);

        expect(mockInstance.setSaveError).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('интеграционные тесты', () => {
    it('должен корректно выполнить полный цикл успешного сохранения', async () => {
      mockServerApi = createMockServerApi(true);

      const dependencies = {
        coreApi: mockCoreApi,
        serverApi: mockServerApi,
      };

      saveForm = new TestSaveForm({
        dependencies,
        instance: mockInstance as unknown as Instance<TTestModel>,
      });

      saveForm.execute(undefined);

      // Проверяем начальное состояние
      expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
      expect(mockInstance.setSaveInProgress).toHaveBeenCalledTimes(1);
      expect(mockServerApi.setData).toHaveBeenCalledTimes(1);

      // Ждем завершения асинхронной операции
      await flushPromises();

      // Проверяем финальное состояние
      expect(mockCoreApi.showSuccessSavingForm).toHaveBeenCalledTimes(1);
      expect(mockInstance.rememberState).toHaveBeenCalledTimes(1);
      expect(mockInstance.setSaveError).not.toHaveBeenCalled();
    });

    it('должен корректно выполнить полный цикл сохранения с ошибкой', async () => {
      mockServerApi = createMockServerApi(false);

      const dependencies = {
        coreApi: mockCoreApi,
        serverApi: mockServerApi,
      };

      saveForm = new TestSaveForm({
        dependencies,
        instance: mockInstance as unknown as Instance<TTestModel>,
      });

      saveForm.execute(undefined);

      // Проверяем начальное состояние
      expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
      expect(mockInstance.setSaveInProgress).toHaveBeenCalledTimes(1);
      expect(mockServerApi.setData).toHaveBeenCalledTimes(1);

      // Ждем завершения асинхронной операции
      await flushPromises();

      // Проверяем финальное состояние
      expect(mockInstance.setSaveError).toHaveBeenCalledTimes(1);
      expect(mockCoreApi.showFailedToSaveFormError).toHaveBeenCalledTimes(1);
      expect(mockInstance.rememberState).not.toHaveBeenCalled();
    });

    it('должен работать с множественными вызовами save', async () => {
      mockServerApi = createMockServerApi(true);

      const dependencies = {
        coreApi: mockCoreApi,
        serverApi: mockServerApi,
      };

      saveForm = new TestSaveForm({
        dependencies,
        instance: mockInstance as unknown as Instance<TTestModel>,
      });

      // Выполняем несколько вызовов
      saveForm.execute(undefined);
      saveForm.execute(undefined);
      saveForm.execute(undefined);

      expect(mockInstance.setSaveInProgress).toHaveBeenCalledTimes(3);
      expect(mockServerApi.setData).toHaveBeenCalledTimes(3);

      // Ждем завершения всех асинхронных операций
      await flushPromises();

      // Проверяем, что все вызовы обработались
      expect(mockInstance.rememberState).toHaveBeenCalledTimes(3);
      expect(mockCoreApi.showSuccessSavingForm).toHaveBeenCalledTimes(3);
    });

    it('должен корректно работать с execute', async () => {
      mockServerApi = createMockServerApi(true);

      const dependencies = {
        coreApi: mockCoreApi,
        serverApi: mockServerApi,
      };

      saveForm = new TestSaveForm({
        dependencies,
        instance: mockInstance as unknown as Instance<TTestModel>,
      });

      saveForm.execute(undefined);

      // Проверяем, что сохранение запустилось
      expect(mockInstance.setSaveInProgress).toHaveBeenCalledTimes(1);
      expect(mockServerApi.setData).toHaveBeenCalledTimes(1);

      // Ждем завершения
      await flushPromises();

      expect(mockCoreApi.showSuccessSavingForm).toHaveBeenCalledTimes(1);
    });

    it('должен вызвать onSuccess при успешном запросе с передачей данных ответа', async () => {
      saveForm.execute(undefined, { onSuccess });

      // Ждем завершения Promise
      await flushPromises();

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('тестирование типизации', () => {
    it('должен корректно работать с типизированными данными', () => {
      const testData: ITestSaveData = {
        id: 'typed-test',
        name: 'Type Safety Test',
        value: 999,
      };

      mockInstance.fields.currentState = testData;

      const result = saveForm.testGetSaveData();

      expect(result).toEqual(testData);
      expect(result.id).toBe('typed-test');
      expect(result.name).toBe('Type Safety Test');
      expect(result.value).toBe(999);
    });

    it('должен поддерживать различные типы для TData', () => {
      // Проверяем, что типизация работает корректно для разных типов данных
      interface ISimpleSaveData {
        value: string;
      }
      type TSimpleTestModel = TBaseInstance<ISimpleSaveData> & {
        isChildClassValid: boolean;
      };

      class TypedSaveForm extends BaseSaveForm<ISimpleSaveData, void, TSimpleTestModel> {}

      const typedServerApi: IServerApiSave<ISimpleSaveData> = {
        hasAbortedError: jest.fn().mockImplementation(() => {
          return false;
        }),
        setData: jest.fn().mockImplementation(() => {
          return {
            promise: Promise.resolve(),
            abort: jest.fn(),
          };
        }),
      };

      const typedCoreApi: ICoreApiSave = {
        hideAllNotifications: jest.fn(),
        showSuccessSavingForm: jest.fn(),
        showFailedToSaveFormError: jest.fn(),
      };

      const dependencies = {
        coreApi: typedCoreApi,
        serverApi: typedServerApi,
      };

      const typedSaveForm = new TypedSaveForm({
        dependencies,
        instance: mockInstance as unknown as Instance<TSimpleTestModel>,
      });

      // Проверяем, что экземпляр создался без ошибок типизации
      expect(typedSaveForm).toBeInstanceOf(TypedSaveForm);
    });
  });

  describe('граничные случаи', () => {
    it('должен обрабатывать случай с пустыми данными в currentState', () => {
      mockInstance.fields.currentState = {} as ITestSaveData;

      const result = saveForm.testGetSaveData();

      expect(result).toEqual({});
      expect(mockServerApi.setData).not.toHaveBeenCalled();
    });

    it('должен обрабатывать случай, когда abort функция не определена', () => {
      mockServerApi.setData.mockReturnValue({
        promise: Promise.resolve(),
        abort: undefined as unknown as () => void,
      });

      saveForm.execute(undefined);

      expect(() => {
        saveForm.cancel();
      }).not.toThrow();
    });

    it('должен обрабатывать случай с undefined в currentState', () => {
      mockInstance.fields.currentState = undefined as unknown as ITestSaveData;

      const result = saveForm.testGetSaveData();

      expect(result).toBeUndefined();
    });

    it('должен корректно работать при повторном вызове методов', () => {
      // Проверяем идемпотентность методов
      saveForm.testBeforeRun();
      saveForm.testBeforeRun();
      saveForm.testBeforeRun();

      expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(3);
      expect(mockInstance.setSaveInProgress).toHaveBeenCalledTimes(3);

      saveForm.testHandleSuccessAction();
      saveForm.testHandleSuccessAction();

      expect(mockCoreApi.showSuccessSavingForm).toHaveBeenCalledTimes(2);
      expect(mockInstance.rememberState).toHaveBeenCalledTimes(2);
    });
  });

  describe('валидация execute', () => {
    it('должен проверять, что действие разрешено для выполнения', () => {
      expect(saveForm.canExecute()).toBe(true);

      mockInstance.canSave.mockReturnValue(false);

      expect(saveForm.canExecute()).toBe(false);
    });

    it('должен учитывать валидаторы дочерних классов', () => {
      expect(saveForm.canExecute()).toBe(true);

      mockInstance.isChildClassValid = false;

      expect(saveForm.canExecute()).toBe(false);
    });
  });
});
