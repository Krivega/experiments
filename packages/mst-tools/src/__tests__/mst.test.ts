/// <reference types="jest" />
/// <reference types="jest-extended" />
import { reaction } from 'mobx';
import { types } from 'mobx-state-tree';

import type { Instance, SnapshotIn } from 'mobx-state-tree';

const Todo = types
  .model('Todo', {
    title: types.string,
    done: false,
  })
  .actions((self) => {
    return {
      toggle() {
        // eslint-disable-next-line no-param-reassign
        self.done = !self.done;
      },
    };
  });

const Store = types
  .model('Store', {
    todos: types.array(Todo),
  })
  .actions((self) => {
    return {
      addTodo(title: string) {
        self.todos.push({
          title,
          done: false,
        });
      },

      replaceTodos(todos: SnapshotIn<typeof Todo>[]) {
        // @ts-expect-error типизация replace() массива строже, чем snapshot-in массивов
        self.todos.replace(todos);
      },

      replaceTodosAssign(todos: SnapshotIn<typeof Todo>[]) {
        // Пояснение:
        // В MST присваивание `self.todos = snapshot` может согласовать (reconcile)
        // массив "на месте". Это способно сохранить длину/индексы observable-массива
        // и переиспользовать существующие узлы Todo, поэтому derived-значения,
        // основанные на shallow-чтениях вроде `return [...self.todos]`, могут
        // не инвалидироваться.
        // При этом данные в store обновляются (поля узлов), но `reaction`,
        // наблюдающая `todosSliced`, может не сработать.
        // @ts-expect-error типизация assign() массивов менее строгая, чем replace()
        // eslint-disable-next-line no-param-reassign
        self.todos = todos;

        // Если оставляете self.todos = snapshot, в derived-view нужно явно читать наблюдаемые поля элементов
        // (например self.todos.map(t => ({ title: t.title, done: t.done }))),
        // иначе shallow-копия снова может не инвалидироваться при "тихой" подмене содержимого узлов.
      },
    };
  })
  .views((self) => {
    return {
      get todosSliced() {
        return [...self.todos];
      },
    };
  });

const falseError = new Error('falseError');

describe('mst', () => {
  let store: Instance<typeof Store>;

  beforeEach(() => {
    // создаём инстанс из snapshot
    store = Store.create({
      todos: [
        {
          title: 'Get coffee',
        },
      ],
    });
  });

  it('check array', async () => {
    expect.assertions(1);

    const waitChangeTodos = new Promise((resolve, reject) => {
      reaction(
        () => {
          const { todos } = store;

          return todos;
        },
        () => {
          resolve(true);
        },
      );

      setTimeout(() => {
        reject(falseError);
      }, 100);
    });

    store.addTodo('new item');

    return expect(waitChangeTodos).rejects.toEqual(falseError);
  });

  it('check array: replace', async () => {
    expect.assertions(1);

    const waitChangeTodos = new Promise((resolve, reject) => {
      reaction(
        () => {
          const { todos } = store;

          return todos;
        },
        () => {
          resolve(true);
        },
      );

      setTimeout(() => {
        reject(falseError);
      }, 100);
    });

    store.replaceTodos([
      {
        title: 'title new',
        done: false,
      },
    ]);

    return expect(waitChangeTodos).rejects.toEqual(falseError);
  });

  it('check array sliced', async () => {
    expect.assertions(1);

    const waitChangeTodosSliced = new Promise((resolve) => {
      reaction(
        () => {
          const { todosSliced } = store;

          return todosSliced;
        },
        () => {
          resolve(true);
        },
      );
    });

    store.addTodo('new item');

    return expect(waitChangeTodosSliced).resolves.toEqual(true);
  });

  it('check array sliced: replace', async () => {
    expect.assertions(1);

    const waitChangeTodosSliced = new Promise((resolve) => {
      reaction(
        () => {
          const { todosSliced } = store;

          return todosSliced;
        },
        () => {
          resolve(true);
        },
      );
    });

    store.replaceTodos([
      {
        title: 'title new',
        done: false,
      },
    ]);

    return expect(waitChangeTodosSliced).resolves.toEqual(true);
  });

  it('check array sliced: assign (self.todos = todos)', async () => {
    expect.assertions(2);

    let fired = false;
    const disposer = reaction(
      () => {
        return store.todosSliced;
      },
      () => {
        fired = true;
      },
    );

    store.replaceTodosAssign([
      {
        title: 'title new',
        done: false,
      },
    ]);

    // В MST 7 присваивание может согласовать массив "на месте".
    // Для `todosSliced = [...self.todos]` это означает, что shallow-derived
    // значение может не инвалидироваться, поэтому reaction может молчать.

    // Если длина 1 → 1 и узел на индексе тот же,
    // computed не считает значение изменившимся,
    // и reaction не запускается.
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });

    disposer();

    expect(store.todos[0].title).toBe('title new');
    expect(fired).toBe(false);
  });
});
