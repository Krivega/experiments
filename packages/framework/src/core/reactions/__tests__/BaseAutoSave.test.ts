/// <reference types="jest" />
import { flushPromises } from '@experiments/test-utils';
import { debounce } from 'lodash';
import { reaction } from 'mobx';

import { BaseAutoSave } from '../BaseAutoSave';

import type {
  ICoreApiSave,
  ISaveFormInstance,
  IServerApiSave,
  TFieldsStates,
} from '../BaseAutoSaveCustomData';

// Mock dependencies
jest.mock('mobx');
jest.mock('lodash');
jest.mock('@/utils/logger', () => {
  return {
    debugResolve: jest.fn(() => {
      return jest.fn();
    }),
  };
});

interface ITestState {
  field1: string;
  field2: string;
}

type TDependencies = {
  serverApi: IServerApiSave<TFieldsStates<ITestState>>;
  coreApi: ICoreApiSave;
};

const DEFAULT_DELAY = 150;

// Concrete implementation for testing
class TestAutoSave extends BaseAutoSave<ITestState, ISaveFormInstance<ITestState>, TDependencies> {
  public setAbortResponse = (abort: () => void) => {
    this.abortResponse = abort;
  };

  // Expose protected methods for testing
  public getInstanceForTest() {
    return this.instance;
  }

  public getCoreApiForTest() {
    return this.dependencies.coreApi;
  }

  public getServerApiForTest() {
    return this.dependencies.serverApi;
  }

  public getDelayForTest() {
    return this.delay;
  }

  public callHandleStartForTest() {
    this.handleStart();
  }

  public callHandleSuccessForTest() {
    this.handleSuccess();
  }

  public callHandleErrorForTest(error: unknown) {
    this.handleError(error);
  }

  public callGetSaveDataForTest() {
    return this.getSaveData();
  }

  public callGetChangedStateForTest() {
    return this.getChangedState();
  }

  public callServerApiForTest(data: TFieldsStates<ITestState>) {
    return this.callServerApi(data);
  }
}

describe('BaseAutoSave', () => {
  // Mock implementations
  const mockReaction = reaction as jest.Mock;
  const mockDebounce = debounce as jest.Mock;

  // Test instance and dependencies
  let instance: ISaveFormInstance<ITestState>;
  let coreApi: ICoreApiSave;
  let serverApi: IServerApiSave<TFieldsStates<ITestState>>;
  let autoSave: TestAutoSave;
  let mockDebouncedSave: jest.Mock;
  let mockDisposer: jest.Mock;
  let mockSetData: jest.Mock;
  let mockHasAbortedError: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock instance
    instance = {
      setSaveInProgress: jest.fn(),
      setSaveError: jest.fn(),
      isNotSaved: false,
      rememberState: jest.fn(),
      resetToRememberState: jest.fn(),
      fields: {
        currentState: { field1: 'test1', field2: 'test2' },
        changedState: { field1: 'test0' },
      },
      canSave: jest.fn().mockReturnValue(true),
    };

    // Setup mock APIs
    coreApi = {
      hideAllNotifications: jest.fn(),
      showSuccessNotifications: jest.fn(),
      showFailedNotifications: jest.fn(),
    };

    // Setup mock server API methods
    mockSetData = jest.fn().mockImplementation(() => {
      return {
        promise: Promise.resolve(),
        abort: jest.fn(),
      };
    });

    mockHasAbortedError = jest.fn().mockReturnValue(false);

    serverApi = {
      hasAbortedError: mockHasAbortedError,
      setData: mockSetData,
    };

    // Setup debounce mock
    mockDebouncedSave = jest.fn();
    mockDebounce.mockImplementation((function_: () => void) => {
      mockDebouncedSave = jest.fn(function_);

      return mockDebouncedSave;
    });

    // Setup reaction mock
    mockDisposer = jest.fn();
    mockReaction.mockImplementation(
      (getter: () => Partial<ITestState>, effect: (value: Partial<ITestState>) => void) => {
        effect(getter());

        return mockDisposer;
      },
    );

    // Create test instance
    autoSave = new TestAutoSave(
      {
        instance,
        dependencies: {
          coreApi: coreApi as ICoreApiSave,
          serverApi: serverApi as IServerApiSave<TFieldsStates<ITestState>>,
        },
        executableActions: {},
      },
      {
        delay: 1000,
      },
    );
  });

  describe('Конструктор', () => {
    it('должен корректно инициализировать зависимости из параметров', () => {
      expect(autoSave.getInstanceForTest()).toBe(instance);
      expect(autoSave.getCoreApiForTest()).toBe(coreApi);
      expect(autoSave.getServerApiForTest()).toBe(serverApi);
      expect(autoSave.getDelayForTest()).toBe(1000);
    });

    it('должен использовать задержку по умолчанию, если она не указана', () => {
      const defaultAutoSave = new TestAutoSave({
        instance,
        dependencies: {
          coreApi: coreApi as ICoreApiSave,
          serverApi: serverApi as IServerApiSave<TFieldsStates<ITestState>>,
        },
        executableActions: {},
      });

      expect(defaultAutoSave.getDelayForTest()).toBe(DEFAULT_DELAY);
    });
  });

  describe('Настройка автосохранения', () => {
    it('должен настроить реакцию', () => {
      autoSave.start();

      expect(mockReaction).toHaveBeenCalled();
    });

    it('должен очищать ресурсы при отписке', () => {
      autoSave.start();
      autoSave.stop();

      expect(mockDisposer).toHaveBeenCalled();
    });

    it('должен отменять текущий запрос при отписке', async () => {
      const abort = jest.fn();

      mockSetData.mockReturnValueOnce({
        promise: new Promise(() => {}),
        abort,
      });

      autoSave.start();

      await flushPromises();

      autoSave.stop();

      expect(abort).toHaveBeenCalled();
    });
  });

  describe('Процесс сохранения', () => {
    beforeEach(() => {
      mockSetData.mockReturnValue({
        promise: Promise.resolve(),
        abort: jest.fn(),
      });
    });

    it('должен корректно обрабатывать успешное сохранение', async () => {
      return new Promise<void>((resolve) => {
        autoSave.save();

        process.nextTick(() => {
          expect(coreApi.hideAllNotifications).toHaveBeenCalled();
          expect(instance.setSaveInProgress).toHaveBeenCalled();
          expect(coreApi.showSuccessNotifications).toHaveBeenCalled();
          expect(instance.rememberState).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('rememberState не должен быть вызван при сохранении, если состояние isNotSaved', async () => {
      return new Promise<void>((resolve) => {
        autoSave.save();

        instance.isNotSaved = true;

        process.nextTick(() => {
          expect(coreApi.showSuccessNotifications).toHaveBeenCalled();
          expect(instance.rememberState).not.toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('должен корректно обрабатывать ошибку сохранения', async () => {
      return new Promise<void>((resolve) => {
        const error = new Error('Save failed');

        mockSetData.mockReturnValueOnce({
          promise: Promise.reject(error),
          abort: jest.fn(),
        });
        mockHasAbortedError.mockReturnValue(false);

        autoSave.save();

        process.nextTick(() => {
          expect(instance.setSaveError).toHaveBeenCalled();
          expect(coreApi.showFailedNotifications).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('не должен показывать уведомление об ошибке при отмене запроса', async () => {
      return new Promise<void>((resolve) => {
        const error = new Error('Aborted');

        mockSetData.mockReturnValueOnce({
          promise: Promise.reject(error),
          abort: jest.fn(),
        });
        mockHasAbortedError.mockReturnValue(true);

        autoSave.save();

        process.nextTick(() => {
          expect(instance.setSaveError).toHaveBeenCalled();
          expect(coreApi.showFailedNotifications).not.toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('должен отменять предыдущий запрос при повторном сохранении', async () => {
      const abort = jest.fn();

      mockSetData.mockReturnValueOnce({
        promise: new Promise(() => {}),
        abort,
      });

      autoSave.save();

      await flushPromises();

      autoSave.save();

      expect(abort).toHaveBeenCalled();
    });

    it('не должен сохранять данные, если canSave возвращает false', () => {
      (instance.canSave as jest.Mock).mockReturnValue(false);

      autoSave.save();

      expect(mockSetData).not.toHaveBeenCalled();

      // Проверяем, что обработчики начала сохранения не были вызваны
      expect(coreApi.hideAllNotifications).not.toHaveBeenCalled();
      expect(instance.setSaveInProgress).not.toHaveBeenCalled();
    });

    it('должен корректно обрабатывать ошибку в getSaveData', async () => {
      const error = new Error('Error in getSaveData');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spyGetSaveData = jest.spyOn(autoSave as any, 'getSaveData');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spyHandleError = jest.spyOn(autoSave as any, 'handleError');

      spyGetSaveData.mockImplementation(() => {
        throw error;
      });

      autoSave.save();

      await flushPromises();

      expect(coreApi.hideAllNotifications).toHaveBeenCalled();
      expect(instance.setSaveInProgress).toHaveBeenCalled();
      expect(spyHandleError).toHaveBeenCalledWith(error);
      expect(mockSetData).not.toHaveBeenCalled();
    });
  });

  describe('Внутренние методы', () => {
    it('должен корректно получать текущее состояние для сохранения', () => {
      const data = autoSave.callGetSaveDataForTest();

      expect(data).toEqual({
        currentState: {
          field1: 'test1',
          field2: 'test2',
        },
        changedState: { field1: 'test0' },
      });
    });

    it('должен корректно получать измененное состояние', () => {
      const changes = autoSave.callGetChangedStateForTest();

      expect(changes).toBe(instance.fields.changedState);
    });

    it('должен отменять процесс сохранения, если canSave заменяется на false', () => {
      const abort = jest.fn();
      // @ts-ignore
      const spyHandleStart: jest.SpyInstance = jest.spyOn(autoSave, 'handleStart');
      const spySave = jest.spyOn(autoSave, 'save');

      (instance.canSave as jest.Mock).mockReturnValue(false);

      autoSave.setAbortResponse(abort);
      autoSave.save();

      expect(spySave).toHaveReturned();
      expect(abort).toHaveBeenCalledTimes(0);
      expect(spyHandleStart).toHaveBeenCalledTimes(0);
    });

    it('должен корректно вызывать API сервера с правильными данными', () => {
      const data = {
        currentState: { field1: 'test', field2: 'test2' },
        changedState: { field1: 'test00' },
      };

      autoSave.callServerApiForTest(data);

      expect(mockSetData).toHaveBeenCalledWith(data);
    });
  });

  describe('Обработчики событий', () => {
    it('должен корректно настраивать состояние при начале сохранения', () => {
      autoSave.callHandleStartForTest();

      expect(coreApi.hideAllNotifications).toHaveBeenCalled();
      expect(instance.setSaveInProgress).toHaveBeenCalled();
    });

    it('должен корректно обновлять состояние и показывать уведомление при успешном сохранении', () => {
      autoSave.callHandleSuccessForTest();

      expect(instance.rememberState).toHaveBeenCalled();
      expect(coreApi.showSuccessNotifications).toHaveBeenCalled();
    });

    it('должен корректно обрабатывать обычные ошибки', () => {
      mockHasAbortedError.mockReturnValue(false);
      autoSave.callHandleErrorForTest(new Error('test'));

      expect(coreApi.showFailedNotifications).toHaveBeenCalled();
      expect(instance.resetToRememberState).toHaveBeenCalled();
      expect(instance.setSaveError).toHaveBeenCalled();
    });

    it('должен вызывать setSaveError перед resetToRememberState для перехода в Synced после ошибки', () => {
      const callOrder: string[] = [];

      // Мокаем методы чтобы записывать порядок вызовов
      (instance.setSaveError as jest.Mock).mockImplementation(() => {
        callOrder.push('setSaveError');
      });

      (instance.resetToRememberState as jest.Mock).mockImplementation(() => {
        callOrder.push('resetToRememberState');
      });

      mockHasAbortedError.mockReturnValue(false);
      autoSave.callHandleErrorForTest(new Error('test'));

      expect(callOrder).toEqual(['setSaveError', 'resetToRememberState']);
    });

    it('должен корректно обрабатывать ошибки отмены запроса', () => {
      mockHasAbortedError.mockReturnValue(true);
      autoSave.callHandleErrorForTest(new Error('test'));

      expect(coreApi.showFailedNotifications).not.toHaveBeenCalled();
      expect(instance.resetToRememberState).not.toHaveBeenCalled();
      expect(instance.setSaveError).toHaveBeenCalled();
    });

    it('проксирует исходную ошибку в showFailedNotifications', () => {
      mockHasAbortedError.mockReturnValue(false);

      const originalError = { code: 500, message: 'FAIL' };

      autoSave.callHandleErrorForTest(originalError);

      expect(coreApi.showFailedNotifications).toHaveBeenCalledWith(originalError);
      expect(instance.setSaveError).toHaveBeenCalled();
      expect(instance.resetToRememberState).toHaveBeenCalled();
    });
  });
});
