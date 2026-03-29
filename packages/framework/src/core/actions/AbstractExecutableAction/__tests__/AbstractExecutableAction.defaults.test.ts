/// <reference types="jest" />
/* eslint-disable max-classes-per-file */

import { flushPromises } from '@experiments/test-utils';

import Model from '../../AbstractValidatorAction/__fixtures__/MockModel';
import AbstractExecutableAction from '../AbstractExecutableAction';

import type { TInstance } from '../../AbstractValidatorAction/__fixtures__/MockModel';

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

describe('AbstractExecutableAction – поведение по умолчанию', () => {
  it('проверка окружения', () => {
    expect(true).toBe(true);
  });

  let instance: TInstance;

  beforeEach(() => {
    instance = Model.create({ isValid: true });
  });

  /* eslint-disable @typescript-eslint/no-unsafe-call,
    @typescript-eslint/no-unsafe-member-access,
    @typescript-eslint/no-explicit-any */
  describe('Покрытие базовых методов', () => {
    it('должен выполнять все noop-методы без ошибок', async () => {
      class BareExecutableAction extends AbstractExecutableAction<
        TInstance,
        typeof storeDependencies
      > {
        public run() {
          expect(this).toBeInstanceOf(BareExecutableAction);

          return { promise: Promise.resolve(), abort: jest.fn() };
        }

        protected initValidator(): void {
          expect(this).toBeDefined();
        }
      }

      const action = new BareExecutableAction({ instance, dependencies: storeDependencies });

      (action as any).beforeRun();
      (action as any).handleSuccessAction();
      (action as any).handleFinallyAction();
      (action as any).handleErrorValidation();
      (action as any).handleErrorAction(new Error('test'));
      (action as any).debug('test');
      action.cancel();

      action.execute(undefined);
      await flushPromises();

      expect(action.canExecute()).toBe(true);
    });
  });

  describe('Дефолтный initValidator', () => {
    it('должен оставить validator неопределенным, если initValidator не переопределен', () => {
      class NoValidatorAction extends AbstractExecutableAction<
        TInstance,
        typeof storeDependencies
      > {
        public run() {
          expect(this.validator).toBeUndefined();

          return { promise: Promise.resolve(), abort: jest.fn() };
        }
      }

      const action = new NoValidatorAction({ instance, dependencies: storeDependencies });

      expect(action.validator).toBeUndefined();
      expect(action.canExecute()).toBe(true);

      action.execute(undefined);
    });
  });

  describe('Поддержка частичных зависимостей', () => {
    it('должен создаваться и выполняться с пустым объектом зависимостей', async () => {
      class EmptyDependenciesAction extends AbstractExecutableAction<TInstance> {
        public run() {
          expect(this).toBeInstanceOf(EmptyDependenciesAction);

          return { promise: Promise.resolve(), abort: jest.fn() };
        }
      }

      const action = new EmptyDependenciesAction({ instance, dependencies: {} });

      action.execute(undefined);

      await flushPromises();

      expect(action.canExecute()).toBe(true);
    });
  });
  /* eslint-enable @typescript-eslint/no-unsafe-call,
    @typescript-eslint/no-unsafe-member-access,
    @typescript-eslint/no-explicit-any */
});
