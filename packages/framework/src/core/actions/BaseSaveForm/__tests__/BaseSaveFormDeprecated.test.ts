/// <reference types="jest" />
/* eslint-disable max-classes-per-file */
import {
  BaseSaveFormDeprecated,
  type ICoreApiSave,
  type ISaveFormInstance,
  type IServerApiSave,
} from '../BaseSaveFormDeprecated';

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
interface ITestSaveData {
  id: string;
  name: string;
  value: number;
}

// Конкретная реализация BaseSaveForm для тестирования
class TestSaveForm extends BaseSaveFormDeprecated<ITestSaveData> {
  // Публичные геттеры для тестирования защищенных свойств
  public get testInstance() {
    return this.instance;
  }

  public get testServerApi() {
    return this.serverApi;
  }

  public get testCoreApi() {
    return this.coreApi;
  }

  public get testDebug() {
    return this.debug;
  }

  // Публичные методы для тестирования защищенных методов
  public testHandleStart(): void {
    this.handleStart();
  }

  public testHandleSuccess(): void {
    this.handleSuccess();
  }

  public testHandleError(error: unknown): void {
    this.handleError(error);
  }

  public testGetSaveData(): ITestSaveData {
    return this.getSaveData();
  }

  public testCallServerApi(data: ITestSaveData): { promise: Promise<void>; abort: () => void } {
    return this.callServerApi(data);
  }
}

// Создание моков
const createMockInstance = (): jest.Mocked<ISaveFormInstance> => {
  return {
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
  let mockInstance: jest.Mocked<ISaveFormInstance>;
  let mockServerApi: jest.Mocked<IServerApiSave<ITestSaveData>>;
  let mockCoreApi: jest.Mocked<ICoreApiSave>;
  let saveForm: TestSaveForm;
  const onSuccess = jest.fn(() => {});

  beforeEach(() => {
    mockInstance = createMockInstance();
    mockServerApi = createMockServerApi();
    mockCoreApi = createMockCoreApi();

    saveForm = new TestSaveForm({
      instance: mockInstance,
      serverApi: mockServerApi,
      coreApi: mockCoreApi,
      debugNamespace: 'test-save-form',
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
      expect(saveForm.testDebug).toBe(mockDebugFunction);
    });
  });

  describe('метод save', () => {
    describe('успешный сценарий', () => {
      it('должен вызвать handleStart при запуске', () => {
        // Проверяем эффекты handleStart вместо прямого spy
        saveForm.save();

        expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
        expect(mockInstance.setSaveInProgress).toHaveBeenCalledTimes(1);
      });

      it('должен скрыть уведомления и установить состояние сохранения', () => {
        saveForm.save();

        expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
        expect(mockInstance.setSaveInProgress).toHaveBeenCalledTimes(1);
      });

      it('должен получить данные через getSaveData', () => {
        // Проверяем эффекты getSaveData - вызов serverApi с правильными данными
        saveForm.save();

        expect(mockServerApi.setData).toHaveBeenCalledTimes(1);
        expect(mockServerApi.setData).toHaveBeenCalledWith({
          id: 'test-id',
          name: 'test-name',
          value: 42,
        });
      });

      it('должен вызвать серверное API с полученными данными', () => {
        saveForm.save();

        expect(mockServerApi.setData).toHaveBeenCalledTimes(1);
        expect(mockServerApi.setData).toHaveBeenCalledWith({
          id: 'test-id',
          name: 'test-name',
          value: 42,
        });
      });

      it('должен вернуть функцию отмены операции', () => {
        const mockAbort = jest.fn();

        mockServerApi.setData.mockReturnValue({
          promise: Promise.resolve(),
          abort: mockAbort,
        });

        const abortFunction = saveForm.save();

        expect(abortFunction).toBe(mockAbort);
      });

      it('должен вызвать handleSuccess при успешном сохранении', async () => {
        mockServerApi = createMockServerApi(true);

        saveForm = new TestSaveForm({
          instance: mockInstance,
          serverApi: mockServerApi,
          coreApi: mockCoreApi,
          debugNamespace: 'test-save-form',
        });

        saveForm.save();

        // Ждем завершения Promise
        await new Promise((resolve) => {
          setTimeout(resolve, 0);
        });

        expect(mockCoreApi.showSuccessSavingForm).toHaveBeenCalledTimes(1);
        expect(mockInstance.rememberState).toHaveBeenCalledTimes(1);
      });
    });

    describe('сценарий с ошибкой', () => {
      it('должен вызвать handleError при ошибке сохранения', async () => {
        mockServerApi = createMockServerApi(false);

        saveForm = new TestSaveForm({
          instance: mockInstance,
          serverApi: mockServerApi,
          coreApi: mockCoreApi,
          debugNamespace: 'test-save-form',
        });

        saveForm.save();

        // Ждем завершения Promise
        await new Promise((resolve) => {
          setTimeout(resolve, 0);
        });

        expect(mockDebugFunction).toHaveBeenCalledWith('error', expect.any(Error));
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

        saveForm.save();

        await new Promise((resolve) => {
          setTimeout(resolve, 0);
        });

        expect(mockServerApi.hasAbortedError).toHaveBeenCalledWith(testError);
        expect(mockCoreApi.showFailedToSaveFormError).not.toHaveBeenCalled();
        expect(mockInstance.setSaveError).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('метод saveAction', () => {
    it('должен вернуть объект с функцией abort', () => {
      const mockAbort = jest.fn();

      mockServerApi.setData.mockReturnValue({
        promise: Promise.resolve(),
        abort: mockAbort,
      });

      const result = saveForm.saveAction();

      expect(result).toEqual({ abort: mockAbort });
    });

    it('должен запустить процесс сохранения', () => {
      const saveSpy = jest.spyOn(saveForm, 'save');

      saveForm.saveAction();

      expect(saveSpy).toHaveBeenCalledTimes(1);
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
      saveForm.testHandleStart();

      expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
    });

    it('должен установить состояние "сохранение в процессе"', () => {
      saveForm.testHandleStart();

      expect(mockInstance.setSaveInProgress).toHaveBeenCalledTimes(1);
    });
  });

  describe('метод handleSuccess', () => {
    it('должен показать уведомление об успешном сохранении', () => {
      saveForm.testHandleSuccess();

      expect(mockCoreApi.showSuccessSavingForm).toHaveBeenCalledTimes(1);
    });

    it('должен запомнить состояние формы', () => {
      saveForm.testHandleSuccess();

      expect(mockInstance.rememberState).toHaveBeenCalledTimes(1);
    });
  });

  describe('метод handleError', () => {
    it('должен логировать ошибку', () => {
      const testError = new Error('Test save error');

      saveForm.testHandleError(testError);

      expect(mockDebugFunction).toHaveBeenCalledWith('error', testError);
    });

    it('должен показать уведомление об ошибке если запрос не был отменен', () => {
      const testError = new Error('Save failed');

      mockServerApi.hasAbortedError.mockReturnValue(false);

      saveForm.testHandleError(testError);

      expect(mockServerApi.hasAbortedError).toHaveBeenCalledWith(testError);
      expect(mockCoreApi.showFailedToSaveFormError).toHaveBeenCalledTimes(1);
    });

    it('должен не показывать уведомление об ошибке если запрос был отменен', () => {
      const testError = new Error('Aborted');

      mockServerApi.hasAbortedError.mockReturnValue(true);

      saveForm.testHandleError(testError);

      expect(mockServerApi.hasAbortedError).toHaveBeenCalledWith(testError);
      expect(mockCoreApi.showFailedToSaveFormError).not.toHaveBeenCalled();
    });

    it('должен установить состояние ошибки сохранения', () => {
      const testError = new Error('Test error');

      saveForm.testHandleError(testError);

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

        saveForm.testHandleError(error);

        expect(mockDebugFunction).toHaveBeenCalledWith('error', error);
        expect(mockInstance.setSaveError).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('интеграционные тесты', () => {
    it('должен корректно выполнить полный цикл успешного сохранения', async () => {
      mockServerApi = createMockServerApi(true);

      saveForm = new TestSaveForm({
        instance: mockInstance,
        serverApi: mockServerApi,
        coreApi: mockCoreApi,
        debugNamespace: 'integration-test',
      });

      const abortFunction = saveForm.save();

      // Проверяем начальное состояние
      expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
      expect(mockInstance.setSaveInProgress).toHaveBeenCalledTimes(1);
      expect(mockServerApi.setData).toHaveBeenCalledTimes(1);
      expect(typeof abortFunction).toBe('function');

      // Ждем завершения асинхронной операции
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });

      // Проверяем финальное состояние
      expect(mockCoreApi.showSuccessSavingForm).toHaveBeenCalledTimes(1);
      expect(mockInstance.rememberState).toHaveBeenCalledTimes(1);
      expect(mockInstance.setSaveError).not.toHaveBeenCalled();
    });

    it('должен корректно выполнить полный цикл сохранения с ошибкой', async () => {
      mockServerApi = createMockServerApi(false);

      saveForm = new TestSaveForm({
        instance: mockInstance,
        serverApi: mockServerApi,
        coreApi: mockCoreApi,
        debugNamespace: 'integration-error-test',
      });

      const abortFunction = saveForm.save();

      // Проверяем начальное состояние
      expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
      expect(mockInstance.setSaveInProgress).toHaveBeenCalledTimes(1);
      expect(mockServerApi.setData).toHaveBeenCalledTimes(1);
      expect(typeof abortFunction).toBe('function');

      // Ждем завершения асинхронной операции
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });

      // Проверяем финальное состояние
      expect(mockDebugFunction).toHaveBeenCalledWith('error', expect.any(Error));
      expect(mockInstance.setSaveError).toHaveBeenCalledTimes(1);
      expect(mockCoreApi.showFailedToSaveFormError).toHaveBeenCalledTimes(1);
      expect(mockInstance.rememberState).not.toHaveBeenCalled();
    });

    it('должен работать с множественными вызовами save', async () => {
      mockServerApi = createMockServerApi(true);

      saveForm = new TestSaveForm({
        instance: mockInstance,
        serverApi: mockServerApi,
        coreApi: mockCoreApi,
        debugNamespace: 'multiple-saves-test',
      });

      // Выполняем несколько вызовов
      const abort1 = saveForm.save();
      const abort2 = saveForm.save();
      const abort3 = saveForm.save();

      expect(mockInstance.setSaveInProgress).toHaveBeenCalledTimes(3);
      expect(mockServerApi.setData).toHaveBeenCalledTimes(3);
      expect(typeof abort1).toBe('function');
      expect(typeof abort2).toBe('function');
      expect(typeof abort3).toBe('function');

      // Ждем завершения всех асинхронных операций
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      // Проверяем, что все вызовы обработались
      expect(mockInstance.rememberState).toHaveBeenCalledTimes(3);
      expect(mockCoreApi.showSuccessSavingForm).toHaveBeenCalledTimes(3);
    });

    it('должен корректно работать с saveAction', async () => {
      mockServerApi = createMockServerApi(true);

      saveForm = new TestSaveForm({
        instance: mockInstance,
        serverApi: mockServerApi,
        coreApi: mockCoreApi,
        debugNamespace: 'save-action-test',
      });

      const result = saveForm.saveAction();

      expect(result).toHaveProperty('abort');
      expect(typeof result.abort).toBe('function');

      // Проверяем, что сохранение запустилось
      expect(mockInstance.setSaveInProgress).toHaveBeenCalledTimes(1);
      expect(mockServerApi.setData).toHaveBeenCalledTimes(1);

      // Ждем завершения
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });

      expect(mockCoreApi.showSuccessSavingForm).toHaveBeenCalledTimes(1);
    });

    it('должен вызвать onSuccess при успешном запросе с передачей данных ответа', async () => {
      saveForm.save({ onSuccess });

      // Ждем завершения Promise
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });

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

      class TypedSaveForm extends BaseSaveFormDeprecated<ISimpleSaveData> {}

      const typedInstance: ISaveFormInstance = {
        setSaveInProgress: jest.fn(),
        setSaveError: jest.fn(),
        rememberState: jest.fn(),
        fields: {
          currentState: { value: 'test' },
        },
      };

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

      const typedSaveForm = new TypedSaveForm({
        instance: typedInstance,
        serverApi: typedServerApi,
        coreApi: typedCoreApi,
        debugNamespace: 'typed-test',
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

      const result = saveForm.save();

      expect(result).toBeUndefined();
    });

    it('должен обрабатывать случай с undefined в currentState', () => {
      mockInstance.fields.currentState = undefined as unknown as ITestSaveData;

      const result = saveForm.testGetSaveData();

      expect(result).toBeUndefined();
    });

    it('должен корректно работать при повторном вызове методов', () => {
      // Проверяем идемпотентность методов
      saveForm.testHandleStart();
      saveForm.testHandleStart();
      saveForm.testHandleStart();

      expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(3);
      expect(mockInstance.setSaveInProgress).toHaveBeenCalledTimes(3);

      saveForm.testHandleSuccess();
      saveForm.testHandleSuccess();

      expect(mockCoreApi.showSuccessSavingForm).toHaveBeenCalledTimes(2);
      expect(mockInstance.rememberState).toHaveBeenCalledTimes(2);
    });
  });
});
