/* eslint-disable max-classes-per-file */
/* eslint-disable no-console */
/// <reference types="jest" />
import { flushPromises } from '@experiments/test-utils';
import { autorun, reaction } from 'mobx';

import { BaseReaction } from '../../../reactions';
import ExecutableAction from '../__fixtures__/ExecutableAction';
import storeDependencies from '../__fixtures__/storeDependencies';
import TodoModel from '../__fixtures__/TodoModel';
import ToggleTodoAction from '../__fixtures__/ToggleTodoAction';
import UpdateTitleAction from '../__fixtures__/UpdateTitleAction';
import UpdateTitleAsyncAction from '../__fixtures__/UpdateTitleAsyncAction';
import Store from '../Store';

import type { TStoreDependencies } from '../__fixtures__/storeDependencies';
import type { TInstanceTodo } from '../__fixtures__/TodoModel';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type TExecutableActions = {};

type TActionFactoryParams = {
  instance: TInstanceTodo;
  dependencies: TStoreDependencies;
};

type TReactionParams = {
  instance: TInstanceTodo;
  dependencies: TStoreDependencies;
  executableActions: TExecutableActions;
};

class AutoRunReaction extends BaseReaction<TInstanceTodo, typeof storeDependencies> {
  protected run() {
    return autorun(() => {
      console.log('autorun: Todo title changed:', this.instance.title);
    });
  }
}

const defineAutoRunReaction = (params: TReactionParams) => {
  return new AutoRunReaction(params);
};

class MobxReaction extends BaseReaction<TInstanceTodo, typeof storeDependencies> {
  protected run() {
    return reaction(
      () => {
        return this.instance.done;
      },
      (done) => {
        console.log('reaction: Todo done status changed:', done);
      },
    );
  }
}

const defineMobxReaction = (params: TReactionParams) => {
  return new MobxReaction(params);
};

const reactions = [defineAutoRunReaction, defineMobxReaction];

const executableActionFactories = {
  testSound: (params: TActionFactoryParams) => {
    return new ExecutableAction(params);
  },
  toggleTodo: (params: TActionFactoryParams) => {
    return new ToggleTodoAction(params);
  },
  updateTitle: (params: TActionFactoryParams) => {
    return new UpdateTitleAction(params);
  },
  updateTitleAsync: (params: TActionFactoryParams) => {
    return new UpdateTitleAsyncAction(params);
  },
};

const instanceToPublicAPI = (instance: TInstanceTodo) => {
  return {
    getTitle: () => {
      return instance.title;
    },
    hasCompleted: () => {
      return instance.done;
    },
  };
};

const INITIAL_TITLE = 'Learn MobX';

describe('Store', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('Инициализация и базовая функциональность', () => {
    it('должен корректно инициализировать стор с начальным состоянием', () => {
      const store = new Store(
        () => {
          return TodoModel.create({ title: INITIAL_TITLE, done: false });
        },
        {
          reactions,
          executableActionFactories,
          instanceToPublicAPI,
          dependencies: storeDependencies,
        },
      );

      const publicAPI = store.getPublicAPI();

      expect(publicAPI.state.getTitle()).toBe(INITIAL_TITLE);
      expect(publicAPI.state.hasCompleted()).toBe(false);
    });
  });

  describe('Работа с действиями (executableActions)', () => {
    it('должен обновлять состояние при вызове действий', async () => {
      const store = new Store(
        () => {
          return TodoModel.create({ title: INITIAL_TITLE, done: false });
        },
        {
          reactions,
          executableActionFactories,
          instanceToPublicAPI,
          dependencies: storeDependencies,
        },
      );

      const publicAPI = store.getPublicAPI();

      // Вызываем действие toggleTodo
      publicAPI.executableActions.toggleTodo.execute();

      await flushPromises();

      expect(publicAPI.state.getTitle()).toBe(INITIAL_TITLE);
      expect(publicAPI.state.hasCompleted()).toBe(true);

      // Вызываем действие updateTitle
      publicAPI.executableActions.updateTitle.execute('Learn TypeScript');

      await flushPromises();

      expect(publicAPI.state.getTitle()).toBe('Learn TypeScript');
      expect(publicAPI.state.hasCompleted()).toBe(true);
    });

    it('должен возвращать значение из действий при их вызове', async () => {
      const store = new Store(
        () => {
          return TodoModel.create({ title: INITIAL_TITLE, done: false });
        },
        {
          reactions,
          executableActionFactories,
          instanceToPublicAPI,
          dependencies: storeDependencies,
        },
      );

      const publicAPI = store.getPublicAPI();

      expect(publicAPI.state.hasCompleted()).toBe(false);

      publicAPI.executableActions.toggleTodo.execute();

      await flushPromises();

      const result = publicAPI.state.hasCompleted();

      expect(result).toBe(true);
      expect(publicAPI.state.hasCompleted()).toBe(true);
    });

    it('должен изменять состояние без предупреждений для безопасных асинхронных методов', async () => {
      const store = new Store(
        () => {
          return TodoModel.create({ title: INITIAL_TITLE, done: false });
        },
        {
          reactions,
          executableActionFactories,
          instanceToPublicAPI,
          dependencies: storeDependencies,
        },
      );

      const publicAPI = store.getPublicAPI();

      publicAPI.executableActions.updateTitleAsync.execute('Should work');

      await flushPromises();

      expect(publicAPI.state.getTitle()).toBe('Should work');
    });
  });

  describe('Работа с реакциями', () => {
    it('должен вызывать реакции при изменении состояния', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const store = new Store(
        () => {
          return TodoModel.create({ title: INITIAL_TITLE, done: false });
        },
        {
          reactions,
          executableActionFactories,
          instanceToPublicAPI,
          dependencies: storeDependencies,
        },
      );

      const publicAPI = store.getPublicAPI();

      publicAPI.executableActions.toggleTodo.execute();

      await flushPromises();

      expect(consoleSpy).toHaveBeenCalledWith('reaction: Todo done status changed:', true);

      publicAPI.executableActions.updateTitle.execute('Learn TypeScript');

      await flushPromises();

      expect(consoleSpy).toHaveBeenCalledWith('autorun: Todo title changed:', 'Learn TypeScript');

      consoleSpy.mockRestore();
    });
  });

  describe('Поведение после уничтожения стора', () => {
    it('должен корректно уничтожать стор и освобождать ресурсы', () => {
      const store = new Store(
        () => {
          return TodoModel.create({ title: INITIAL_TITLE, done: false });
        },
        {
          reactions,
          executableActionFactories,
          instanceToPublicAPI,
          dependencies: storeDependencies,
        },
      );

      const publicAPI = store.getPublicAPI();
      const destroySpy = jest.spyOn(publicAPI, 'destroy');

      // Уничтожаем стор
      publicAPI.destroy();

      // Проверяем, что метод destroy был вызван
      expect(destroySpy).toHaveBeenCalled();

      // Проверяем, что стор больше не работает
      expect(publicAPI.executableActions.testSound.canExecute).toThrow();
      expect(publicAPI.executableActions.testSound.execute).toThrow();
      expect(publicAPI.executableActions.toggleTodo.canExecute).toThrow();
      expect(publicAPI.executableActions.toggleTodo.execute).toThrow();
      expect(publicAPI.executableActions.updateTitle.canExecute).toThrow();
      expect(publicAPI.executableActions.updateTitle.execute).toThrow();
    });

    it('должен изменять состояние без предупреждений для безопасных асинхронных методов', async () => {
      const store = new Store(
        () => {
          return TodoModel.create({ title: INITIAL_TITLE, done: false });
        },
        {
          reactions,
          executableActionFactories,
          instanceToPublicAPI,
          dependencies: storeDependencies,
        },
      );

      const publicAPI = store.getPublicAPI();

      publicAPI.executableActions.updateTitleAsync.execute('Should work');

      await flushPromises();

      expect(publicAPI.state.getTitle()).toBe('Should work');
    });

    it('должен блокировать изменение состояния и предупреждать при уничтоженной модели', async () => {
      const store = new Store(
        () => {
          return TodoModel.create({ title: INITIAL_TITLE, done: false });
        },
        {
          reactions,
          executableActionFactories,
          instanceToPublicAPI,
          dependencies: storeDependencies,
        },
      );

      const publicAPI = store.getPublicAPI();

      publicAPI.executableActions.updateTitleAsync.execute('Should not work');

      publicAPI.destroy();

      await flushPromises();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Method "setTitle" skipped: model is destroyed'),
      );
      expect(publicAPI.state.getTitle()).toBe(INITIAL_TITLE); // Значение не изменилось
    });

    it('должен возвращать undefined для не-функциональных свойств при уничтоженной модели', () => {
      // Для работы с приватным instance нужно типизировать модель
      const store = new Store<
        typeof TodoModel,
        TStoreDependencies,
        ReturnType<typeof instanceToPublicAPI>
      >(
        () => {
          return TodoModel.create({ title: INITIAL_TITLE, done: false });
        },
        {
          reactions,
          executableActionFactories,
          instanceToPublicAPI,
          dependencies: storeDependencies,
        },
      );

      const publicAPI = store.getPublicAPI();

      publicAPI.destroy();

      // @ts-expect-error: Accessing private property for testing
      const modelInstance = store.modelInstanceProxy;

      expect(modelInstance.title).toBeUndefined();
      expect(modelInstance.done).toBeUndefined();
    });

    it('должен отписываться от реакций в обратном порядке при уничтожении', () => {
      const disposerCalls: number[] = [];

      class DisposeFirstCallReaction extends BaseReaction<TInstanceTodo, typeof storeDependencies> {
        // eslint-disable-next-line @typescript-eslint/class-methods-use-this
        protected run() {
          return () => {
            disposerCalls.push(1);
          };
        }
      }

      const defineDisposeFirstCallReaction = (params: TReactionParams) => {
        return new DisposeFirstCallReaction(params);
      };

      class DisposeSecondCallReaction extends BaseReaction<
        TInstanceTodo,
        typeof storeDependencies
      > {
        // eslint-disable-next-line @typescript-eslint/class-methods-use-this
        protected run() {
          return () => {
            disposerCalls.push(2);
          };
        }
      }

      const defineDisposeSecondCallReaction = (params: TReactionParams) => {
        return new DisposeSecondCallReaction(params);
      };

      class DisposeThirdCallReaction extends BaseReaction<TInstanceTodo, typeof storeDependencies> {
        // eslint-disable-next-line @typescript-eslint/class-methods-use-this
        protected run() {
          return () => {
            disposerCalls.push(3);
          };
        }
      }

      const defineDisposeThirdCallReaction = (params: TReactionParams) => {
        return new DisposeThirdCallReaction(params);
      };

      const testReactions = [
        defineDisposeFirstCallReaction,
        defineDisposeSecondCallReaction,
        defineDisposeThirdCallReaction,
      ];

      const testStore = new Store(
        () => {
          return TodoModel.create({ title: INITIAL_TITLE, done: false });
        },
        {
          reactions: testReactions,
          instanceToPublicAPI,
          executableActionFactories: {},
          dependencies: storeDependencies,
        },
      );

      testStore.getPublicAPI().destroy();

      expect(disposerCalls).toEqual([3, 2, 1]);
    });

    it('должен вызывать метод cancel для исполняемых действий при уничтожении', () => {
      const executableActionsFactories = {
        action1: (params: TActionFactoryParams) => {
          return new ExecutableAction(params);
        },
        action2: (params: TActionFactoryParams) => {
          return new ExecutableAction(params);
        },
        action3: (params: TActionFactoryParams) => {
          return new ExecutableAction(params);
        },
      };

      const testStore = new Store(
        () => {
          return TodoModel.create({ title: INITIAL_TITLE, done: false });
        },
        {
          reactions: [],
          instanceToPublicAPI,
          executableActionFactories: executableActionsFactories,
          dependencies: storeDependencies,
        },
      );

      const { executableActions, destroy } = testStore.getPublicAPI();

      const { action1, action2, action3 } = executableActions;

      // Ставим spy на cancel у экземпляров
      const spyCancel1 = jest.spyOn(action1, 'cancel');
      const spyCancel2 = jest.spyOn(action2, 'cancel');
      const spyCancel3 = jest.spyOn(action3, 'cancel');

      destroy();

      expect(spyCancel1).toHaveBeenCalled();
      expect(spyCancel2).toHaveBeenCalled();
      expect(spyCancel3).toHaveBeenCalled();
    });

    it('должен корректно обрабатывать множественные вызовы destroy', () => {
      const store = new Store(
        () => {
          return TodoModel.create({ title: INITIAL_TITLE, done: false });
        },
        {
          reactions,
          executableActionFactories,
          instanceToPublicAPI,
          dependencies: storeDependencies,
        },
      );

      const publicAPI = store.getPublicAPI();

      // First destroy
      publicAPI.destroy();

      // Second destroy should not throw
      expect(() => {
        publicAPI.destroy();
      }).not.toThrow();
    });
  });

  describe('Работа с выполняемыми действиями (executableActions)', () => {
    it('должен корректно инициализировать executableActions', () => {
      const store = new Store(
        () => {
          return TodoModel.create({ title: INITIAL_TITLE, done: false });
        },
        {
          reactions,
          executableActionFactories,
          instanceToPublicAPI,
          dependencies: storeDependencies,
        },
      );

      const publicAPI = store.getPublicAPI();

      expect(publicAPI.executableActions).toBeDefined();
      expect(publicAPI.executableActions.testSound).toBeDefined();
      expect(typeof publicAPI.executableActions.testSound.execute).toBe('function');
      expect(typeof publicAPI.executableActions.testSound.canExecute).toBe('function');
    });

    it('должен предоставлять доступ к методам execute и canExecute для executableActions', async () => {
      const store = new Store(
        () => {
          return TodoModel.create({ title: INITIAL_TITLE, done: false });
        },
        {
          reactions,
          executableActionFactories,
          instanceToPublicAPI,
          dependencies: storeDependencies,
        },
      );

      const publicAPI = store.getPublicAPI();
      const testSoundAction = publicAPI.executableActions.testSound;

      expect(testSoundAction).toBeDefined();

      // Проверяем, что canExecute работает (todo не завершена, поэтому validator возвращает true)
      expect(testSoundAction.canExecute({ id: 'test', name: 'test' })).toBe(true);

      // Завершаем todo и проверяем, что canExecute возвращает false
      publicAPI.executableActions.toggleTodo.execute();

      await flushPromises();

      expect(testSoundAction.canExecute({ id: 'test', name: 'test' })).toBe(false);
    });

    it('должен корректно выполнять executableAction и вызывать зависимости', async () => {
      const store = new Store(
        () => {
          return TodoModel.create({ title: INITIAL_TITLE, done: false });
        },
        {
          reactions,
          executableActionFactories,
          instanceToPublicAPI,
          dependencies: storeDependencies,
        },
      );

      const publicAPI = store.getPublicAPI();
      const hideAllNotificationsSpy = jest.spyOn(storeDependencies.coreApi, 'hideAllNotifications');
      const patchDataSpy = jest.spyOn(storeDependencies.serverApi, 'patchData');

      const testSoundAction = publicAPI.executableActions.testSound;

      expect(publicAPI.state.hasCompleted()).toBe(false);

      // Выполняем action
      testSoundAction.execute({ id: '1', name: 'John Doe' });

      await flushPromises();

      // Проверяем, что состояние изменилось
      expect(publicAPI.state.hasCompleted()).toBe(true);

      // Проверяем, что зависимости были вызваны
      expect(hideAllNotificationsSpy).toHaveBeenCalled();
      expect(patchDataSpy).toHaveBeenCalledWith({ id: '1', name: 'John Doe' });

      hideAllNotificationsSpy.mockRestore();
      patchDataSpy.mockRestore();
    });

    it('должен вызвать onSuccess при успешном сохранении для executableAction', async () => {
      const store = new Store(
        () => {
          return TodoModel.create({ title: INITIAL_TITLE, done: false });
        },
        {
          reactions,
          executableActionFactories,
          instanceToPublicAPI,
          dependencies: storeDependencies,
        },
      );

      const publicAPI = store.getPublicAPI();

      const { testSound } = publicAPI.executableActions;

      expect(publicAPI.state.hasCompleted()).toBe(false);

      const onSuccessMocked = jest.fn();

      // Выполняем action
      testSound.execute(
        { id: '1', name: 'John Doe' },
        {
          onSuccess: ({ id, name }) => {
            onSuccessMocked({ id, name });
          },
        },
      );

      await flushPromises();

      expect(onSuccessMocked).toHaveBeenCalledWith({ id: '1', name: 'John Doe' });
    });

    it('должен создавать стор с пустыми зависимостями', () => {
      const storeWithoutDependencies = new Store(
        () => {
          return TodoModel.create({ title: INITIAL_TITLE, done: false });
        },
        {
          // типизация не позволит передавать реакции без передачи зависимостей в стор
          reactions: [],
          // типизация не позволит передавать executableActions без передачи зависимостей в стор
          executableActionFactories: {},
          instanceToPublicAPI,
          dependencies: {},
        },
      );

      const publicAPI = storeWithoutDependencies.getPublicAPI();

      expect(Object.keys(publicAPI.executableActions).length).toBe(0);
    });

    it('должен создавать Store без executableActions, если они не переданы', () => {
      const storeWithoutExecutableActions = new Store(
        () => {
          return TodoModel.create({ title: INITIAL_TITLE, done: false });
        },
        {
          reactions,
          instanceToPublicAPI,
          executableActionFactories: {},
          dependencies: storeDependencies,
        },
      );

      const publicAPI = storeWithoutExecutableActions.getPublicAPI();

      expect(Object.keys(publicAPI.executableActions).length).toBe(0);
    });
  });
});
