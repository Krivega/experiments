/// <reference types="jest" />
import { resolveSetter } from '@experiments/mst-tools';
import { reaction } from 'mobx';
import { types } from 'mobx-state-tree';

import { BaseReaction } from '../BaseReaction';

import type { Instance } from 'mobx-state-tree';

const Model = types
  .model({
    isAvailableExecutableAction: types.optional(types.boolean, false),
  })
  .actions((self) => {
    const resolveSelfSetter = resolveSetter(self);
    const setIsAvailableExecutableAction = resolveSelfSetter('isAvailableExecutableAction');

    return { setIsAvailableExecutableAction };
  });

type TInstance = Instance<typeof Model>;

const serverApi = {};
const coreApi = {};
const dependencies = { serverApi, coreApi };

const executableActions = {
  executableAction: {
    execute: jest.fn(),
    cancel: jest.fn(),
    canExecute: jest.fn(),
  },
};

const disposerMocked = jest.fn();

class ConcreteReaction extends BaseReaction<
  TInstance,
  typeof dependencies,
  typeof executableActions
> {
  protected run() {
    // Пример работы с executableAction из ExecutableActionsFactory
    const predicateExecutableAction = () => {
      return this.instance.isAvailableExecutableAction;
    };

    const runExecutableAction = () => {
      this.executableActions.executableAction.execute();
    };

    const cancelExecutableAction = () => {
      this.executableActions.executableAction.cancel();
    };

    const disposeRunExecutableAction = reaction(predicateExecutableAction, runExecutableAction);

    return () => {
      cancelExecutableAction();
      disposeRunExecutableAction();

      disposerMocked();
    };
  }
}

describe('BaseReaction', () => {
  let concreteReaction: ConcreteReaction;
  let instance: Instance<typeof Model>;

  beforeEach(() => {
    instance = Model.create();

    concreteReaction = new ConcreteReaction({
      instance,
      dependencies,
      executableActions,
    });
  });

  afterEach(() => {
    concreteReaction.stop();
    jest.clearAllMocks();
  });

  describe('executableAction', () => {
    it('должен вызвать executableAction после старта и изменении значения в модели', () => {
      concreteReaction.start();

      expect(executableActions.executableAction.execute).toHaveBeenCalledTimes(0);

      instance.setIsAvailableExecutableAction(true);

      expect(executableActions.executableAction.execute).toHaveBeenCalledTimes(1);
    });

    it('не должен вызвать executableAction если start не был вызван', () => {
      instance.setIsAvailableExecutableAction(true);

      expect(executableActions.executableAction.execute).not.toHaveBeenCalled();
    });

    it('не должен вызвать executableAction если значение не изменилось', () => {
      concreteReaction.start();

      instance.setIsAvailableExecutableAction(false);

      expect(executableActions.executableAction.execute).not.toHaveBeenCalled();
    });

    it('не должен вызвать executableAction после вызова stop', () => {
      concreteReaction.start();
      concreteReaction.stop();

      instance.setIsAvailableExecutableAction(true);

      expect(executableActions.executableAction.execute).not.toHaveBeenCalled();
      expect(disposerMocked).toHaveBeenCalledTimes(1);
    });

    it('должен отменить executableAction после остановки реакции', () => {
      concreteReaction.start();

      instance.setIsAvailableExecutableAction(true);

      expect(executableActions.executableAction.cancel).toHaveBeenCalledTimes(0);

      concreteReaction.stop();

      expect(executableActions.executableAction.cancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Логика подписки и отписки', () => {
    it('не должен накапливать подписки при повторном вызове start', () => {
      concreteReaction.start();
      concreteReaction.start();

      expect(disposerMocked).toHaveBeenCalledTimes(1);
    });
  });
});
