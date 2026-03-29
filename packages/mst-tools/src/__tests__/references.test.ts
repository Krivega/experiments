/// <reference types="jest" />
/// <reference types="jest-extended" />

import { destroy, detach, isValidReference, tryReference, types } from 'mobx-state-tree';

import type { Instance } from 'mobx-state-tree';

describe('MST References', () => {
  describe('Базовые ссылки и идентификаторы', () => {
    const Todo = types.model('Todo', {
      id: types.identifier,
      title: types.string,
    });

    const TodoStore = types.model('TodoStore', {
      todos: types.array(Todo),
      selectedTodo: types.reference(Todo),
    });

    it('должен разрешать ссылку по идентификатору', () => {
      expect.assertions(2);

      const store = TodoStore.create({
        todos: [
          { id: '47', title: 'Get coffee' },
          { id: '48', title: 'Write code' },
        ],
        selectedTodo: '47',
      });

      expect(store.selectedTodo.title).toBe('Get coffee');
      expect(store.selectedTodo.id).toBe('47');
    });

    it('должен обновлять ссылку при изменении идентификатора в снимке', () => {
      expect.assertions(1);

      const updatedStore = TodoStore.create({
        todos: [
          { id: '47', title: 'Get coffee' },
          { id: '48', title: 'Write code' },
        ],
        selectedTodo: '48',
      });

      expect(updatedStore.selectedTodo.title).toBe('Write code');
    });

    it('должен использовать тот же экземпляр объекта при ссылке на тот же идентификатор', () => {
      expect.assertions(1);

      const store = TodoStore.create({
        todos: [{ id: '47', title: 'Get coffee' }],
        selectedTodo: '47',
      });

      expect(store.selectedTodo).toBe(store.todos[0]);
    });

    it('должен обрабатывать ссылку с maybeNull когда идентификатор не существует', () => {
      expect.assertions(1);

      const TodoStoreNullable = types.model('TodoStoreNullable', {
        todos: types.array(Todo),
        selectedTodo: types.maybeNull(types.reference(Todo)),
      });

      const store = TodoStoreNullable.create({
        todos: [{ id: '47', title: 'Get coffee' }],
        selectedTodo: undefined,
      });

      // maybeNull creates null when undefined is provided
      expect(store.selectedTodo).toBeNull();
    });
  });

  describe('Опциональные и возможно-пустые ссылки', () => {
    const User = types.model('User', {
      id: types.identifier,
      name: types.string,
    });

    const UserStore = types.model('UserStore', {
      users: types.array(User),
      selectedUser: types.maybeNull(types.reference(User)),
    });

    it('должен поддерживать null ссылки с maybeNull', () => {
      expect.assertions(1);

      const store = UserStore.create({
        users: [{ id: '1', name: 'Alice' }],
        selectedUser: undefined,
      });

      // maybeNull creates null when undefined is provided
      expect(store.selectedUser).toBeNull();
    });

    it('должен поддерживать валидные ссылки с maybeNull', () => {
      expect.assertions(1);

      const store = UserStore.create({
        users: [{ id: '1', name: 'Alice' }],
        selectedUser: '1',
      });

      expect(store.selectedUser?.name).toBe('Alice');
    });
  });

  describe('Настраиваемые ссылки', () => {
    const User = types.model('User', {
      id: types.identifier,
      name: types.string,
    });

    const createUserByNameReference = () => {
      const StoreInner = types.model('Store', {
        users: types.array(User),
        selection: types.maybeNull(
          types.reference(User, {
            // Given an identifier, find the user
            // @ts-expect-error
            get(
              identifier: string,
              parent: {
                users: Instance<typeof User>[];
              },
            ) {
              return parent.users.find((u) => {
                return u.name === identifier;
              });
            },
            // Given a user, produce the identifier that should be stored
            set(value: Instance<typeof User>) {
              return value.name;
            },
          }),
        ),
      });

      return StoreInner;
    };

    const Store = createUserByNameReference();

    it('должен разрешать ссылку используя пользовательскую логику get', () => {
      expect.assertions(2);

      const store = Store.create({
        users: [
          { id: '1', name: 'Michel' },
          { id: '2', name: 'Mattia' },
        ],
        selection: 'Mattia',
      });

      expect(store.selection?.name).toBe('Mattia');
      expect(store.selection?.id).toBe('2');
    });

    it('должен сохранять пользовательский идентификатор используя логику set', () => {
      expect.assertions(1);

      const StoreWithActions = types
        .model('StoreWithActions', {
          users: types.array(User),
          selection: types.maybeNull(
            types.reference(User, {
              // Given an identifier, find the user
              // @ts-expect-error
              get(
                identifier: string,
                parent: {
                  users: Instance<typeof User>[];
                },
              ) {
                return parent.users.find((u) => {
                  return u.name === identifier;
                });
              },
              // Given a user, produce the identifier that should be stored
              set(value: Instance<typeof User>) {
                return value.name;
              },
            }),
          ),
        })
        .actions((self) => {
          return {
            setSelection(user: Instance<typeof User> | null) {
              // eslint-disable-next-line no-param-reassign
              self.selection = user;
            },
          };
        });

      const store = StoreWithActions.create({
        users: [
          { id: '1', name: 'Michel' },
          { id: '2', name: 'Mattia' },
        ],
        selection: undefined,
      });

      store.setSelection(store.users[0]);

      expect(store.selection?.name).toBe('Michel');
    });

    it('должен возвращать undefined когда пользовательский get не может найти совпадение', () => {
      expect.assertions(1);

      const store = Store.create({
        users: [
          { id: '1', name: 'Michel' },
          { id: '2', name: 'Mattia' },
        ],
        selection: 'NonExistent',
      });

      expect(store.selection).toBeUndefined();
    });
  });

  describe('Валидация ссылок - isValidReference', () => {
    const Product = types.model('Product', {
      id: types.identifier,
      name: types.string,
    });

    const Cart = types
      .model('Cart', {
        products: types.array(Product),
        selectedProduct: types.maybeNull(types.reference(Product)),
      })
      .actions((self) => {
        return {
          removeProduct(id: string) {
            const index = self.products.findIndex((p) => {
              return p.id === id;
            });

            if (index >= 0) {
              self.products.splice(index, 1);
            }
          },
          destroyProduct(index: number) {
            destroy(self.products[index]);
          },
          detachProduct(index: number) {
            detach(self.products[index]);
          },
        };
      });

    it('должен валидировать что ссылка действительна', () => {
      expect.assertions(1);

      const cart = Cart.create({
        products: [{ id: '1', name: 'Coffee' }],
        selectedProduct: '1',
      });

      const isValid = isValidReference(() => {
        return cart.selectedProduct;
      });

      expect(isValid).toBe(true);
    });

    it('должен валидировать что undefined ссылка возвращает false', () => {
      expect.assertions(1);

      const cart = Cart.create({
        products: [{ id: '1', name: 'Coffee' }],
        selectedProduct: undefined,
      });

      const isValid = isValidReference(() => {
        return cart.selectedProduct;
      });

      // isValidReference returns false for undefined references
      expect(isValid).toBe(false);
    });

    it('должен обнаруживать недействительную ссылку после уничтожения цели', () => {
      expect.assertions(2);

      const cart = Cart.create({
        products: [{ id: '1', name: 'Coffee' }],
        selectedProduct: '1',
      });

      expect(
        isValidReference(() => {
          return cart.selectedProduct;
        }),
      ).toBe(true);

      // Destroy the referenced product
      cart.destroyProduct(0);

      expect(
        isValidReference(() => {
          return cart.selectedProduct;
        }),
      ).toBe(false);
    });

    it('должен обнаруживать недействительную ссылку после отсоединения цели', () => {
      expect.assertions(2);

      const cart = Cart.create({
        products: [{ id: '1', name: 'Coffee' }],
        selectedProduct: '1',
      });

      expect(
        isValidReference(() => {
          return cart.selectedProduct;
        }),
      ).toBe(true);

      // Detach the referenced product
      cart.detachProduct(0);

      expect(
        isValidReference(() => {
          return cart.selectedProduct;
        }),
      ).toBe(false);
    });
  });

  describe('Валидация ссылок - tryReference', () => {
    const Book = types.model('Book', {
      id: types.identifier,
      title: types.string,
    });

    const Library = types
      .model('Library', {
        books: types.array(Book),
        currentBook: types.maybeNull(types.reference(Book)),
      })
      .actions((self) => {
        return {
          removeBook(id: string) {
            const index = self.books.findIndex((b) => {
              return b.id === id;
            });

            if (index >= 0) {
              self.books.splice(index, 1);
            }
          },
          destroyBook(index: number) {
            destroy(self.books[index]);
          },
        };
      });

    it('должен возвращать ссылку когда она действительна', () => {
      expect.assertions(2);

      const library = Library.create({
        books: [{ id: '1', title: 'MST Guide' }],
        currentBook: '1',
      });

      const maybeBook = tryReference(() => {
        return library.currentBook;
      });

      expect(maybeBook).not.toBeUndefined();
      expect(maybeBook?.title).toBe('MST Guide');
    });

    it('должен возвращать undefined когда ссылка недействительна', () => {
      expect.assertions(1);

      const library = Library.create({
        books: [{ id: '1', title: 'MST Guide' }],
        currentBook: '1',
      });

      // Destroy the referenced book
      library.destroyBook(0);

      const maybeBook = tryReference(() => {
        return library.currentBook;
      });

      expect(maybeBook).toBeUndefined();
    });

    it('должен возвращать undefined для undefined ссылки', () => {
      expect.assertions(1);

      const library = Library.create({
        books: [{ id: '1', title: 'MST Guide' }],
        currentBook: undefined,
      });

      const maybeBook = tryReference(() => {
        return library.currentBook;
      });

      // tryReference returns undefined for undefined references
      expect(maybeBook).toBeUndefined();
    });
  });

  describe('Хук onInvalidated', () => {
    it('должен вызывать onInvalidated когда цель ссылки уничтожена', () => {
      expect.assertions(2);

      const onInvalidatedMock = jest.fn();

      const Item = types.model('Item', {
        id: types.identifier,
        name: types.string,
      });

      const Container = types
        .model('Container', {
          items: types.array(Item),
          selectedItem: types.maybeNull(
            types.reference(Item, {
              onInvalidated(event) {
                onInvalidatedMock(event);
              },
            }),
          ),
        })
        .actions((self) => {
          return {
            destroyItem(index: number) {
              destroy(self.items[index]);
            },
          };
        });

      const container = Container.create({
        items: [{ id: '1', name: 'Item 1' }],
        selectedItem: '1',
      });

      container.destroyItem(0);

      expect(onInvalidatedMock).toHaveBeenCalledTimes(1);
      expect(onInvalidatedMock).toHaveBeenCalledWith(
        expect.objectContaining({
          cause: 'destroy',
          invalidId: '1',
        }),
      );
    });

    it('должен вызывать onInvalidated когда цель ссылки отсоединена', () => {
      expect.assertions(2);

      const onInvalidatedMock = jest.fn();

      const Item = types.model('Item', {
        id: types.identifier,
        name: types.string,
      });

      const Container = types
        .model('Container', {
          items: types.array(Item),
          selectedItem: types.maybeNull(
            types.reference(Item, {
              onInvalidated(event) {
                onInvalidatedMock(event);
              },
            }),
          ),
        })
        .actions((self) => {
          return {
            detachItem(index: number) {
              detach(self.items[index]);
            },
          };
        });

      const container = Container.create({
        items: [{ id: '1', name: 'Item 1' }],
        selectedItem: '1',
      });

      container.detachItem(0);

      expect(onInvalidatedMock).toHaveBeenCalledTimes(1);
      expect(onInvalidatedMock).toHaveBeenCalledWith(
        expect.objectContaining({
          cause: 'detach',
          invalidId: '1',
        }),
      );
    });

    it('должен предоставлять функцию removeRef в событии onInvalidated', () => {
      expect.assertions(2);

      let removeRefFunction: (() => void) | undefined;

      const Item = types.model('Item', {
        id: types.identifier,
        name: types.string,
      });

      const Container = types
        .model('Container', {
          items: types.array(Item),
          selectedItem: types.maybeNull(
            types.reference(Item, {
              onInvalidated(event) {
                removeRefFunction = event.removeRef;
              },
            }),
          ),
        })
        .actions((self) => {
          return {
            destroyItem(index: number) {
              destroy(self.items[index]);
            },
          };
        });

      const container = Container.create({
        items: [{ id: '1', name: 'Item 1' }],
        selectedItem: '1',
      });

      container.destroyItem(0);

      expect(removeRefFunction).not.toBeUndefined();
      expect(typeof removeRefFunction).toBe('function');
    });
  });

  describe('types.safeReference', () => {
    describe('в свойствах модели (acceptsUndefined: true по умолчанию)', () => {
      const Todo = types.model('Todo', {
        id: types.identifier,
        title: types.string,
      });

      const TodoStore = types
        .model('TodoStore', {
          todos: types.array(Todo),
          selectedTodo: types.safeReference(Todo),
        })
        .actions((self) => {
          return {
            destroyTodo(index: number) {
              destroy(self.todos[index]);
            },
            detachTodo(index: number) {
              detach(self.todos[index]);
            },
          };
        });

      it('должен автоматически устанавливать undefined когда цель уничтожена', () => {
        expect.assertions(2);

        const store = TodoStore.create({
          todos: [{ id: '1', title: 'Task 1' }],
          selectedTodo: '1',
        });

        expect(store.selectedTodo).not.toBeUndefined();

        store.destroyTodo(0);

        expect(store.selectedTodo).toBeUndefined();
      });

      it('должен автоматически устанавливать undefined когда цель отсоединена', () => {
        expect.assertions(2);

        const store = TodoStore.create({
          todos: [{ id: '1', title: 'Task 1' }],
          selectedTodo: '1',
        });

        expect(store.selectedTodo).not.toBeUndefined();

        store.detachTodo(0);

        expect(store.selectedTodo).toBeUndefined();
      });

      it('должен принимать undefined как начальное значение', () => {
        expect.assertions(1);

        const store = TodoStore.create({
          todos: [{ id: '1', title: 'Task 1' }],
          selectedTodo: undefined,
        });

        expect(store.selectedTodo).toBeUndefined();
      });
    });

    describe('в массивах (acceptsUndefined: false)', () => {
      const Tag = types.model('Tag', {
        id: types.identifier,
        name: types.string,
      });

      const Post = types
        .model('Post', {
          tags: types.array(Tag),
          selectedTags: types.array(types.safeReference(Tag, { acceptsUndefined: false })),
        })
        .actions((self) => {
          return {
            destroyTag(index: number) {
              destroy(self.tags[index]);
            },
            detachTag(index: number) {
              detach(self.tags[index]);
            },
          };
        });

      it('должен автоматически удалять из массива когда цель уничтожена', () => {
        expect.assertions(3);

        const post = Post.create({
          tags: [
            { id: '1', name: 'TypeScript' },
            { id: '2', name: 'React' },
          ],
          selectedTags: ['1', '2'],
        });

        expect(post.selectedTags).toHaveLength(2);

        post.destroyTag(0);

        expect(post.selectedTags).toHaveLength(1);
        expect(post.selectedTags[0].name).toBe('React');
      });

      it('должен автоматически удалять из массива когда цель отсоединена', () => {
        expect.assertions(3);

        const post = Post.create({
          tags: [
            { id: '1', name: 'TypeScript' },
            { id: '2', name: 'React' },
          ],
          selectedTags: ['1', '2'],
        });

        expect(post.selectedTags).toHaveLength(2);

        post.detachTag(0);

        expect(post.selectedTags).toHaveLength(1);
        expect(post.selectedTags[0].name).toBe('React');
      });

      it('должен удалять все недействительные ссылки из массива', () => {
        expect.assertions(2);

        const post = Post.create({
          tags: [
            { id: '1', name: 'TypeScript' },
            { id: '2', name: 'React' },
            { id: '3', name: 'MobX' },
          ],
          selectedTags: ['1', '2', '3'],
        });

        expect(post.selectedTags).toHaveLength(3);

        post.destroyTag(0);
        post.destroyTag(0); // Note: after first destroy, index shifts

        expect(post.selectedTags).toHaveLength(1);
      });
    });

    describe('в картах (acceptsUndefined: false)', () => {
      const Category = types.model('Category', {
        id: types.identifier,
        name: types.string,
      });

      const CatalogStore = types
        .model('CatalogStore', {
          categories: types.array(Category),
          favoriteCategories: types.map(types.safeReference(Category, { acceptsUndefined: false })),
        })
        .actions((self) => {
          return {
            destroyCategory(index: number) {
              destroy(self.categories[index]);
            },
            detachCategory(index: number) {
              detach(self.categories[index]);
            },
          };
        });

      it('должен автоматически удалять из карты когда цель уничтожена', () => {
        expect.assertions(2);

        const store = CatalogStore.create({
          categories: [
            { id: '1', name: 'Electronics' },
            { id: '2', name: 'Books' },
          ],
          favoriteCategories: {
            first: '1',
            second: '2',
          },
        });

        expect(store.favoriteCategories.size).toBe(2);

        store.destroyCategory(0);

        expect(store.favoriteCategories.size).toBe(1);
      });

      it('должен автоматически удалять из карты когда цель отсоединена', () => {
        expect.assertions(3);

        const store = CatalogStore.create({
          categories: [
            { id: '1', name: 'Electronics' },
            { id: '2', name: 'Books' },
          ],
          favoriteCategories: {
            first: '1',
            second: '2',
          },
        });

        expect(store.favoriteCategories.size).toBe(2);

        store.detachCategory(0);

        expect(store.favoriteCategories.size).toBe(1);
        expect(store.favoriteCategories.get('second')?.name).toBe('Books');
      });
    });

    describe('с пользовательскими get/set', () => {
      const User = types.model('User', {
        id: types.identifier,
        email: types.string,
      });

      const createStoreWithCustomRef = () => {
        const StoreInner = types
          .model('Store', {
            users: types.array(User),
            selectedUser: types.safeReference(User, {
              // @ts-expect-error
              get(
                identifier: string,
                parent: {
                  users: Instance<typeof User>[];
                },
              ) {
                return (
                  parent.users.find((u) => {
                    return u.email === identifier;
                  }) ?? undefined
                );
              },
              set(value: Instance<typeof User>) {
                return value.email;
              },
            }),
          })
          .actions((self) => {
            return {
              destroyUser(index: number) {
                destroy(self.users[index]);
              },
            };
          });

        return StoreInner;
      };

      const Store = createStoreWithCustomRef();

      it('должен работать с пользовательскими get/set и автоматической инвалидацией', () => {
        expect.assertions(2);

        const store = Store.create({
          users: [{ id: '1', email: 'user@example.com' }],
          selectedUser: 'user@example.com',
        });

        expect(store.selectedUser).not.toBeUndefined();
        store.destroyUser(0);

        expect(store.selectedUser).toBeUndefined();
      });
    });

    describe('с удалением и повторным добавлением элементов', () => {
      const Task = types.model('Task', {
        id: types.identifier,
        title: types.string,
      });

      const TaskStore = types
        .model('TaskStore', {
          tasks: types.array(Task),
          activeTask: types.safeReference(Task),
        })
        .actions((self) => {
          return {
            removeTask(id: string) {
              const index = self.tasks.findIndex((task) => {
                return task.id === id;
              });

              if (index >= 0) {
                self.tasks.splice(index, 1);
              }
            },
            addTask(task: { id: string; title: string }) {
              self.tasks.push(task);
            },
            setActiveTask(id: string | undefined) {
              // @ts-expect-error
              // eslint-disable-next-line no-param-reassign
              self.activeTask = id;
            },
          };
        });

      it('должен автоматически обрабатывать ссылку при удалении и повторном добавлении элемента', () => {
        expect.assertions(5);

        const store = TaskStore.create({
          tasks: [
            { id: '1', title: 'Task 1' },
            { id: '2', title: 'Task 2' },
          ],
          activeTask: '1',
        });

        // Проверяем, что ссылка активна
        expect(store.activeTask?.title).toBe('Task 1');

        // Удаляем активную задачу
        store.removeTask('1');

        // safeReference должен автоматически установить undefined
        expect(store.activeTask).toBeUndefined();

        // Добавляем задачу обратно с тем же ID
        store.addTask({ id: '1', title: 'Task 1 Updated' });

        // safeReference НЕ восстанавливает ссылку автоматически
        expect(store.activeTask).toBeUndefined();

        // Нужно вручную установить ссылку на новую задачу
        store.setActiveTask('1');
        expect(store.activeTask?.title).toBe('Task 1 Updated');
        expect(store.activeTask?.id).toBe('1');
      });
    });
  });

  describe('Уникальность идентификаторов', () => {
    const Item = types.model('Item', {
      id: types.identifier,
      value: types.string,
    });

    const Container = types
      .model('Container', {
        items: types.array(Item),
      })
      .actions((self) => {
        return {
          addItem(item: { id: string; value: string }) {
            self.items.push(item);
          },
        };
      });

    it('должен обрабатывать добавление элементов с уникальными идентификаторами', () => {
      expect.assertions(2);

      const container = Container.create({
        items: [{ id: '1', value: 'First' }],
      });

      container.addItem({ id: '2', value: 'Second' });

      expect(container.items).toHaveLength(2);
      expect(container.items[1].id).toBe('2');
    });

    it('должен разрешать одинаковые идентификаторы в разных контейнерах', () => {
      expect.assertions(2);

      const container1 = Container.create({
        items: [{ id: '1', value: 'First Container' }],
      });

      const container2 = Container.create({
        items: [{ id: '1', value: 'Second Container' }],
      });

      expect(container1.items[0].id).toBe('1');
      expect(container2.items[0].id).toBe('1');
    });
  });

  describe('Уточнение идентификаторов', () => {
    it('должен валидировать формат идентификатора используя уточнение', () => {
      expect.assertions(1);

      const Car = types.model('Car', {
        id: types.refinement(types.identifier, (identifier) => {
          return identifier.startsWith('Car_');
        }),
        model: types.string,
      });

      const Garage = types.model('Garage', {
        cars: types.array(Car),
      });

      expect(() => {
        Garage.create({
          cars: [{ id: 'InvalidId', model: 'Tesla' }],
        });
      }).toThrow();
    });

    it('должен принимать валидный идентификатор с уточнением', () => {
      expect.assertions(1);

      const Car = types.model('Car', {
        id: types.refinement(types.identifier, (identifier) => {
          return identifier.startsWith('Car_');
        }),
        model: types.string,
      });

      const Garage = types.model('Garage', {
        cars: types.array(Car),
      });

      const garage = Garage.create({
        cars: [{ id: 'Car_123', model: 'Tesla' }],
      });

      expect(garage.cars[0].id).toBe('Car_123');
    });
  });

  describe('Map.put() с идентификаторами', () => {
    const Product = types.model('Product', {
      id: types.identifier,
      name: types.string,
    });

    const ProductStore = types
      .model('ProductStore', {
        products: types.map(Product),
      })
      .actions((self) => {
        return {
          addProduct(product: { id: string; name: string }) {
            self.products.put(product);
          },
        };
      });

    it('должен использовать идентификатор как ключ при использовании map.put()', () => {
      expect.assertions(2);

      const store = ProductStore.create({
        products: {},
      });

      store.addProduct({ id: 'prod_1', name: 'Laptop' });

      expect(store.products.has('prod_1')).toBe(true);
      expect(store.products.get('prod_1')?.name).toBe('Laptop');
    });
  });

  describe('Междеревные ссылки', () => {
    const Author = types.model('Author', {
      id: types.identifier,
      name: types.string,
    });

    const Book = types.model('Book', {
      id: types.identifier,
      title: types.string,
      authorId: types.reference(Author),
    });

    const Library = types.model('Library', {
      authors: types.array(Author),
      books: types.array(Book),
    });

    it('должен разрешать ссылки между разными массивами в одном дереве', () => {
      expect.assertions(2);

      const library = Library.create({
        authors: [
          { id: 'author_1', name: 'John Doe' },
          { id: 'author_2', name: 'Jane Smith' },
        ],
        books: [
          { id: 'book_1', title: 'MST Handbook', authorId: 'author_1' },
          { id: 'book_2', title: 'React Guide', authorId: 'author_2' },
        ],
      });

      expect(library.books[0].authorId.name).toBe('John Doe');
      expect(library.books[1].authorId.name).toBe('Jane Smith');
    });
  });

  describe('Согласование ссылок', () => {
    const Task = types.model('Task', {
      id: types.identifier,
      title: types.string,
    });

    const TaskStore = types
      .model('TaskStore', {
        tasks: types.array(Task),
        activeTask: types.maybeNull(types.reference(Task)),
      })
      .actions((self) => {
        return {
          updateTasks(tasks: { id: string; title: string }[]) {
            // @ts-expect-error - replacing array for reconciliation test
            // eslint-disable-next-line no-param-reassign
            self.tasks = tasks;
          },
          removeTask(id: string) {
            const index = self.tasks.findIndex((task) => {
              return task.id === id;
            });

            if (index >= 0) {
              self.tasks.splice(index, 1);
            }
          },
          addTask(task: { id: string; title: string }) {
            self.tasks.push(task);
          },
        };
      });

    it('должен согласовывать ссылки при обновлении данных', () => {
      expect.assertions(3);

      const store = TaskStore.create({
        tasks: [{ id: '1', title: 'Task 1' }],
        activeTask: '1',
      });

      const taskInstance = store.activeTask;

      expect(taskInstance).not.toBeNull();

      // Apply snapshot with same structure
      store.updateTasks([{ id: '1', title: 'Task 1 Updated' }]);

      // Reference should still point to the same (reconciled) instance
      expect(store.activeTask?.title).toBe('Task 1 Updated');
      expect(store.activeTask).toBe(taskInstance);
    });

    it('должен обрабатывать ссылку при удалении и повторном добавлении элемента', () => {
      expect.assertions(4);

      const store = TaskStore.create({
        tasks: [
          { id: '1', title: 'Task 1' },
          { id: '2', title: 'Task 2' },
        ],
        activeTask: '1',
      });

      // Проверяем, что ссылка активна
      expect(store.activeTask?.title).toBe('Task 1');

      // Удаляем активную задачу
      store.removeTask('1');

      // Ссылка должна стать недействительной (используем tryReference для безопасной проверки)
      const activeTaskAfterRemoval = tryReference(() => {
        return store.activeTask;
      });

      expect(activeTaskAfterRemoval).toBeUndefined();

      // Добавляем задачу обратно с тем же ID
      store.addTask({ id: '1', title: 'Task 1 Updated' });

      // Ссылка должна снова стать действительной и указывать на обновленную задачу
      expect(store.activeTask?.title).toBe('Task 1 Updated');
      expect(store.activeTask?.id).toBe('1');
    });
  });
});
