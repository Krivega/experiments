import { destroy, isAlive } from 'mobx-state-tree';

import type { IAnyModelType, Instance } from 'mobx-state-tree';

type TBaseDependencies = Partial<Record<'serverApi' | 'coreApi', unknown>>;

/**
 * Базовый контракт executable-действия: методы cancel / canExecute / execute
 * P — точный кортеж параметров метода execute (сохраняем, не расширяем!).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TBaseExecutableAction<TExecuteArgs extends any[] = any[]> = {
  cancel: () => void;
  canExecute: (...args: TExecuteArgs) => boolean;
  execute: (...args: TExecuteArgs) => void;
};

/**
 * Фабрика executable-действия для конкретной MST-модели и зависимостей.
 * R — реальный возвращаемый тип (например, класс, расширяющий AbstractExecutableAction),
 * главное, чтобы он содержал методы cancel / canExecute / execute с любыми параметрами.
 */
type TCreateExecutableAction<
  TModel extends IAnyModelType,
  TDependencies extends TBaseDependencies,
  TExecutableAction extends TBaseExecutableAction = TBaseExecutableAction,
> = (params: { instance: Instance<TModel>; dependencies: TDependencies }) => TExecutableAction;

// Базовый контракт реакции
type TBaseReaction = {
  start: () => void;
  stop: () => void;
};

type TReaction<
  TModel extends IAnyModelType,
  TDependencies extends TBaseDependencies,
  TExecutableActionFactories extends Record<
    string,
    TCreateExecutableAction<TModel, TDependencies>
  > = Record<string, TCreateExecutableAction<TModel, TDependencies>>,
  // Возвращаемые типы берём напрямую из фабрик, чтобы сохранить точные сигнатуры
  TExecutableActions extends Record<
    string,
    ReturnType<TExecutableActionFactories[keyof TExecutableActionFactories]>
  > = {
    [K in keyof TExecutableActionFactories]: ReturnType<TExecutableActionFactories[K]>;
  },
> = (parameters: {
  instance: Instance<TModel>;
  dependencies: TDependencies;
  executableActions: TExecutableActions;
}) => {
  start: () => void;
  stop: () => void;
};

class Store<
  TModel extends IAnyModelType,
  TDependencies extends TBaseDependencies,
  TPublicAPIInstance,
  TExecutableActionFactories extends Record<
    string,
    TCreateExecutableAction<TModel, TDependencies>
  > = Record<string, TCreateExecutableAction<TModel, TDependencies>>,
  // Возвращаемые типы берём напрямую из фабрик, чтобы сохранить точные сигнатуры
  TExecutableActions extends Record<
    string,
    ReturnType<TExecutableActionFactories[keyof TExecutableActionFactories]>
  > = {
    [K in keyof TExecutableActionFactories]: ReturnType<TExecutableActionFactories[K]>;
  },
  TReactions extends TReaction<
    TModel,
    TDependencies,
    TExecutableActionFactories,
    TExecutableActions
  >[] = TReaction<TModel, TDependencies, TExecutableActionFactories, TExecutableActions>[],
> {
  private readonly modelInstance: Instance<TModel>;

  private readonly modelInstanceProxy: Instance<TModel>;

  private reactions: TBaseReaction[];

  private readonly executableActions: TExecutableActions;

  private readonly instanceToPublicAPI: (store: Instance<TModel>) => TPublicAPIInstance;

  private isDestroyed = false;

  private readonly dependencies: TDependencies;

  public constructor(
    createModelInstance: () => Instance<TModel>,
    {
      reactions,
      executableActionFactories,
      instanceToPublicAPI,
      dependencies,
    }: {
      reactions: TReactions;
      executableActionFactories: TExecutableActionFactories;
      instanceToPublicAPI: (store: Instance<TModel>) => TPublicAPIInstance;
      dependencies: TDependencies;
    },
  ) {
    this.dependencies = dependencies;
    this.instanceToPublicAPI = instanceToPublicAPI;
    this.modelInstance = createModelInstance();
    this.modelInstanceProxy = this.createSafeProxy();
    this.executableActions = this.initExecutableActions(executableActionFactories);
    this.reactions = this.initReactions(reactions);
  }

  public getPublicAPI() {
    return {
      state: this.getPublicAPIInstance(),
      executableActions: this.executableActions,
      destroy: () => {
        this.destroy();
      },
    };
  }

  // Метод для получения публичных данных из модели
  private getPublicAPIInstance(): TPublicAPIInstance {
    return this.instanceToPublicAPI(this.modelInstance);
  }

  // Создаёт безопасную прокси-обёртку для MST-модели с защитой от доступа к удалённым свойствам
  private readonly createSafeProxy = () => {
    const getDummyInstance = (target: Instance<TModel>, prop: string | symbol) => {
      if (typeof target[prop] === 'function') {
        // Возвращаем пустой метод если было обращение к методу несуществующей модели
        return () => {};
      }

      return undefined;
    };

    return new Proxy(this.modelInstance, {
      get(target, prop, receiver) {
        if (!isAlive(target)) {
          // eslint-disable-next-line no-console
          console.warn(`Method "${String(prop)}" skipped: model is destroyed`);

          return getDummyInstance(target, prop);
        }

        const instance = Reflect.get(target, prop, receiver);

        return instance;
      },
    });
  };

  private destroy(): void {
    this.disposeReactions();
    this.disposeExecutableActions();

    // Уничтожаем экземпляр модели
    destroy(this.modelInstance);
    this.isDestroyed = true;
  }

  // Инициализируем реакции и подписываем их
  private initReactions(reactions: TReactions) {
    return Object.values(reactions).map((reaction) => {
      const reactionInstance = reaction({
        instance: this.modelInstanceProxy,
        dependencies: this.dependencies,
        executableActions: this.executableActions,
      });

      reactionInstance.start();

      return reactionInstance;
    });
  }

  private destroyGuard() {
    if (this.isDestroyed) {
      throw new Error('Store is destroyed');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private wrapWithDestroyGuard<F extends (...args: any[]) => unknown>(function_: F): F {
    // Возвращаем функцию-обёртку c точной сигнатурой исходной функции `fn`

    // @ts-ignore — дженерики гарантируют корректность типов
    return ((...args: Parameters<F>) => {
      this.destroyGuard();

      return function_(...(args as Parameters<F>));
    }) as F;
  }

  // Инициализируем executable actions

  private initExecutableActions<
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    TActionName extends keyof TExecutableActions = keyof TExecutableActions,
  >(executableActionFactories: TExecutableActionFactories): TExecutableActions {
    const executableActions = {} as TExecutableActions;

    for (const [actionName, executableActionFactory] of Object.entries(executableActionFactories)) {
      const actionNameTyped = actionName as TActionName;
      const executableAction = executableActionFactory({
        instance: this.modelInstanceProxy,
        dependencies: this.dependencies,
      }) as TExecutableActions[TActionName];

      executableAction.canExecute = this.wrapWithDestroyGuard(executableAction.canExecute);
      executableAction.execute = this.wrapWithDestroyGuard(executableAction.execute);

      executableActions[actionNameTyped] = executableAction as TExecutableActions[TActionName];
    }

    return executableActions;
  }

  private disposeReactions() {
    // Отписываем реакции в обратном порядке
    this.reactions.toReversed().forEach((reaction) => {
      reaction.stop();
    });
    this.reactions = [];
  }

  private disposeExecutableActions() {
    Object.values(this.executableActions).forEach((executableAction) => {
      executableAction.cancel();
    });
  }
}

export default Store;
