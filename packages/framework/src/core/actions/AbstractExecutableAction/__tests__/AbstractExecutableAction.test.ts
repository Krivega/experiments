/// <reference types="jest" />

import { flushPromises } from '@experiments/test-utils';

import Model from '../../AbstractValidatorAction/__fixtures__/MockModel';
import ValidatorAction from '../__fixtures__/ValidatorAction';
import AbstractExecutableAction from '../AbstractExecutableAction';

import type { TInstance } from '../../AbstractValidatorAction/__fixtures__/MockModel';

// Моки для зависимостей
const mockDebugFunction = jest.fn();

jest.mock('@/utils/logger', () => {
  return {
    debugResolve: jest.fn(() => {
      return mockDebugFunction;
    }),
  };
});

const storeDependencies = {
  serverApi: {
    getData: async (_data: { id: string; name: string }) => {
      return { id: '1', name: 'John Doe' };
    },

    patchData: async (_data: { uid: string; description: string }) => {
      return { uid: '1', description: 'John Doe' };
    },
  },
  coreApi: {
    onSubscribe: (callback: (id: string) => void) => {
      return (id: string) => {
        callback(id);
      };
    },
    hideAllNotifications: () => {},
  },
};

const serverApiError = new Error('Server API error');

class ConcreteExecutableAction extends AbstractExecutableAction<
  TInstance,
  typeof storeDependencies
> {
  public runMock = jest.fn();

  public beforeRunMock = jest.fn();

  public cancelMock = jest.fn();

  public handleErrorMock = jest.fn();

  public handleSuccessMock = jest.fn();

  public handleFinallyMock = jest.fn();

  public isServerApiErrorMock = false;

  private serverApiError: Error = serverApiError;

  public setServerApiErrorMock(error?: Error): void {
    if (error) {
      this.serverApiError = error;
    }

    this.isServerApiErrorMock = true;
  }

  public resetServerApiErrorMock(): void {
    this.isServerApiErrorMock = false;

    this.serverApiError = serverApiError;
  }

  public initValidator(): void {
    this.validator = new ValidatorAction({ instance: this.instance });
  }

  public beforeRun(): void {
    this.beforeRunMock();
    this.dependencies.coreApi.hideAllNotifications();
  }

  public run() {
    if (this.isServerApiErrorMock) {
      return {
        promise: Promise.reject(this.serverApiError),
        abort: () => {
          this.cancelMock();
        },
      };
    }

    this.runMock();

    return {
      promise: Promise.resolve(),
      abort: () => {
        this.cancelMock();
      },
    };
  }

  public handleErrorAction(): void {
    this.handleErrorMock();
  }

  public handleErrorValidation(): void {
    this.handleErrorMock();
  }

  public handleSuccessAction(): void {
    this.handleSuccessMock();
  }

  public handleFinallyAction(): void {
    this.handleFinallyMock();
  }
}

describe('AbstractExecutableAction', () => {
  let action: ConcreteExecutableAction;
  let instance: TInstance;
  let spyInit: jest.SpyInstance;
  let spyRun: jest.SpyInstance;
  let spyHandleErrorAction: jest.SpyInstance;
  let spyHandleErrorValidation: jest.SpyInstance;

  beforeEach(() => {
    instance = Model.create({ isValid: true });
    spyInit = jest.spyOn(ConcreteExecutableAction.prototype, 'initValidator');
    spyRun = jest.spyOn(ConcreteExecutableAction.prototype, 'run');
    spyHandleErrorAction = jest.spyOn(ConcreteExecutableAction.prototype, 'handleErrorAction');
    spyHandleErrorValidation = jest.spyOn(
      ConcreteExecutableAction.prototype,
      'handleErrorValidation',
    );

    action = new ConcreteExecutableAction({ instance, dependencies: storeDependencies });
  });

  afterEach(() => {
    jest.clearAllMocks();
    ValidatorAction.prototype.isValid = jest.fn().mockReturnValue(true);
    action.resetServerApiErrorMock();
  });

  describe('Инициализация', () => {
    it('должен вызывать метод initValidator при создании', () => {
      expect(spyInit).toHaveBeenCalledTimes(1);
    });

    it('должен инициализироваться с валидатором, переданным в initValidator', () => {
      expect(action.validator).toBeInstanceOf(ValidatorAction);
    });
  });

  describe('Метод canExecute', () => {
    it('должен возвращать true, если валидатор валиден', () => {
      ValidatorAction.prototype.isValid = jest.fn().mockReturnValue(true);

      expect(action.canExecute()).toBe(true);
    });

    it('должен возвращать false, если валидатор невалиден', () => {
      ValidatorAction.prototype.isValid = jest.fn().mockReturnValue(false);

      expect(action.canExecute()).toBe(false);
    });

    it('должен возвращать true, если валидатор не инициализирован', () => {
      spyInit.mockImplementationOnce(jest.fn());

      action = new ConcreteExecutableAction({ instance, dependencies: storeDependencies });

      expect(action.canExecute()).toBe(true);
    });
  });

  describe('Метод execute', () => {
    it('должен проверить метод canExecute перед выполнением run', () => {
      const canExecuteSpy = jest.spyOn(action, 'canExecute');

      action.execute(undefined);

      expect(canExecuteSpy).toHaveBeenCalledTimes(1);
    });

    it('должен вызвать метод run, если canExecute возвращает true', () => {
      ValidatorAction.prototype.isValid = jest.fn().mockReturnValue(true);
      expect(action.canExecute()).toBe(true);

      action.execute(undefined);

      expect(spyRun).toHaveBeenCalledTimes(1);
    });

    it('не должен вызывать run, если canExecute возвращает false', () => {
      ValidatorAction.prototype.isValid = jest.fn().mockReturnValue(false);
      expect(action.canExecute()).toBe(false);

      action.execute(undefined);

      expect(spyRun).not.toHaveBeenCalled();
    });
  });

  describe('Обработка ошибок', () => {
    it('должен логировать ошибку', async () => {
      action.setServerApiErrorMock();

      action.execute(undefined);

      await flushPromises();

      expect(mockDebugFunction).toHaveBeenCalled();
      expect(mockDebugFunction).toHaveBeenCalledWith('error', serverApiError);
    });

    it('должен корректно обрабатывать различные типы ошибок', async () => {
      const errorCases = [
        new Error('Standard error'),
        new Error('Network error'),
        new Error('Validation error'),
      ];

      for (const error of errorCases) {
        // Сбрасываем моки перед каждым тестом
        jest.clearAllMocks();
        action.resetServerApiErrorMock();

        action.setServerApiErrorMock(error);

        action.execute(undefined);

        // eslint-disable-next-line no-await-in-loop
        await flushPromises();

        expect(mockDebugFunction).toHaveBeenCalledTimes(1);
        expect(mockDebugFunction).toHaveBeenCalledWith('error', error);
      }
    });

    it('должен вызвать метод handleErrorAction, если при вызове run возникла ошибка', async () => {
      ValidatorAction.prototype.isValid = jest.fn().mockReturnValue(true);
      action.setServerApiErrorMock();

      action.execute(undefined);

      await flushPromises();

      expect(spyHandleErrorAction).toHaveBeenCalledTimes(1);
    });

    it('должен вызвать метод handleErrorValidation, если canExecute возвращает false', () => {
      ValidatorAction.prototype.isValid = jest.fn().mockReturnValue(false);
      expect(action.canExecute()).toBe(false);

      action.execute(undefined);

      expect(spyHandleErrorValidation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Успешное выполнение', () => {
    it('должен вызвать handleSuccessAction при успешном выполнении run', async () => {
      ValidatorAction.prototype.isValid = jest.fn().mockReturnValue(true);
      action.isServerApiErrorMock = false;

      action.execute(undefined);

      await flushPromises();

      expect(action.handleSuccessMock).toHaveBeenCalledTimes(1);
      expect(action.runMock).toHaveBeenCalledTimes(1);
    });

    it('должен вызвать handleFinallyAction при любом результате выполнения', async () => {
      ValidatorAction.prototype.isValid = jest.fn().mockReturnValue(true);
      action.isServerApiErrorMock = false;

      action.execute(undefined);

      await flushPromises();

      expect(action.handleFinallyMock).toHaveBeenCalledTimes(1);
    });

    it('должен вызывать onFinally в опциях после успешного выполнения', async () => {
      ValidatorAction.prototype.isValid = jest.fn().mockReturnValue(true);
      action.isServerApiErrorMock = false;

      const onFinally = jest.fn();

      action.execute(undefined, { onFinally });

      await flushPromises();

      expect(onFinally).toHaveBeenCalledTimes(1);
    });

    it('должен вызвать handleFinallyAction даже при ошибке', async () => {
      ValidatorAction.prototype.isValid = jest.fn().mockReturnValue(true);
      action.setServerApiErrorMock();

      action.execute(undefined);

      await flushPromises();

      expect(action.handleFinallyMock).toHaveBeenCalledTimes(1);
    });

    it('должен вызывать onFinally в опциях даже при ошибке', async () => {
      ValidatorAction.prototype.isValid = jest.fn().mockReturnValue(true);
      action.setServerApiErrorMock();

      const onFinally = jest.fn();

      action.execute(undefined, { onFinally });

      await flushPromises();

      expect(onFinally).toHaveBeenCalledTimes(1);
    });
  });

  describe('Метод cancel', () => {
    it('должен вызывать метод cancel', () => {
      action.execute(undefined);
      action.cancel();

      expect(action.cancelMock).toHaveBeenCalledTimes(1);
    });
  });
});
