/// <reference types="jest" />
import { getSnapshot, types } from 'mobx-state-tree';

import { createStateField } from '..';

describe('createStateField', () => {
  describe('базовая функциональность', () => {
    const prepareSetValue = jest.fn((argument?: string) => {
      return argument?.toUpperCase();
    });

    const ModelFormField = createStateField(types.string, {
      initialValue: '',
      prepareSetValue,
    });

    let formField: ReturnType<typeof ModelFormField.create>;

    beforeEach(() => {
      formField = ModelFormField.create();
    });

    it('должен корректно инициализировать поле с начальными значениями', () => {
      expect(formField.value).toBe('');
      expect(formField.disabled).toBe(false);
      expect(formField.getField()).toHaveProperty('getValue');
      expect(formField.getField()).toHaveProperty('setValue');
      expect(formField.getField()).toHaveProperty('hasDisabled');
    });

    it('должен корректно получать установленное значение через getField.getValue()', () => {
      formField.setValue('new value');

      expect(formField.value).toBe('NEW VALUE');
      expect(formField.getField().getValue()).toBe('NEW VALUE');
    });

    it('должен сохранять ссылку на исходный объект при использовании getField', async () => {
      const speedCopy = formField.getField();

      speedCopy.setValue('new value');

      expect(formField.getField()).toBe(speedCopy);
    });

    it('должен применять prepareSetValue при установке значения через setValue', () => {
      formField.setValue('new value');

      expect(formField.value).toBe('NEW VALUE');

      expect(prepareSetValue).toHaveBeenCalledTimes(1);
      expect(prepareSetValue).toHaveBeenCalledWith('new value');
    });

    describe('управление состоянием disabled', () => {
      it('должен корректно управлять состоянием disabled', () => {
        // Проверяем начальное состояние
        expect(formField.disabled).toBe(false);
        expect(formField.getField().hasDisabled()).toBe(false);

        // Отключаем поле
        formField.disable();
        expect(formField.disabled).toBe(true);
        expect(formField.getField().hasDisabled()).toBe(true);

        // Включаем поле
        formField.enable();
        expect(formField.disabled).toBe(false);
        expect(formField.getField().hasDisabled()).toBe(false);
      });

      it('должен сохранять состояние disabled при изменении значения', () => {
        formField.disable();
        expect(formField.disabled).toBe(true);

        formField.setValue('new value');
        expect(formField.value).toBe('NEW VALUE');
        expect(formField.disabled).toBe(true);
        expect(formField.getField().hasDisabled()).toBe(true);
      });

      it('должен корректно работать с операциями снапшота', () => {
        formField.disable();
        formField.setValue('test value');

        const snapshot = getSnapshot(formField);
        const newFormField = ModelFormField.create(snapshot);

        expect(newFormField.disabled).toBe(true);
        expect(newFormField.value).toBe('TEST VALUE');
        expect(newFormField.getField().hasDisabled()).toBe(true);
      });
    });
  });

  describe('работа с safeReference', () => {
    // Создаем тестовую модель с safeReference
    const TestModel = types.model({
      id: types.identifier,
      name: types.string,
    });

    const TestStore = types
      .model({
        items: types.array(TestModel),
        selectedItem: createStateField(types.safeReference(TestModel), {
          initialValue: undefined,
        }),
      })
      .actions((self) => {
        return {
          removeItem(index: number) {
            self.items.splice(index, 1);
          },
        };
      });

    let store: typeof TestStore.Type;
    let selectedItemField: ReturnType<typeof store.selectedItem.getField>;

    beforeEach(() => {
      // Инициализируем стор с тестовыми данными
      store = TestStore.create({
        items: [
          { id: '1', name: 'Item 1' },
          { id: '2', name: 'Item 2' },
        ],
        selectedItem: {},
      });
      selectedItemField = store.selectedItem.getField();
    });

    it('должен инициализироваться с undefined значением', () => {
      expect(selectedItemField.getValue()).toBeUndefined();
    });

    it('должен корректно устанавливать и получать значение по ссылке', () => {
      const item = store.items[0];

      selectedItemField.setValue(item.id);
      expect(selectedItemField.getValue()).toBe(item);
    });

    it('должен корректно обрабатывать недействительные ссылки', () => {
      // Устанавливаем ссылку на существующий элемент
      selectedItemField.setValue(store.items[0].id);
      expect(selectedItemField.getValue()).toBe(store.items[0]);

      // Удаляем элемент из массива через действие
      store.removeItem(0);

      // safeReference должен автоматически установить значение в undefined
      expect(selectedItemField.getValue()).toBeUndefined();
    });

    it('должен корректно работать с prepareSetValue', () => {
      const TestStoreWithPrepare = types.model({
        items: types.array(TestModel),
        selectedItem: createStateField(types.safeReference(TestModel), {
          initialValue: undefined,
          prepareSetValue: (value: string | number | undefined) => {
            // Если передан undefined, возвращаем ID первого элемента
            if (value === undefined) {
              return store.items[0].id;
            }

            return value;
          },
        }),
      });

      const storeWithPrepare = TestStoreWithPrepare.create({
        items: [
          { id: '1', name: 'Item 1' },
          { id: '2', name: 'Item 2' },
        ],
        selectedItem: {},
      });

      const selectedItemFieldWithPrepare = storeWithPrepare.selectedItem.getField();

      // При установке undefined должен вернуться первый элемент
      selectedItemFieldWithPrepare.setValue(undefined);
      expect(selectedItemFieldWithPrepare.getValue()).toBe(storeWithPrepare.items[0]);

      // При установке конкретного значения должно использоваться оно
      const secondItem = storeWithPrepare.items[1];

      selectedItemFieldWithPrepare.setValue(secondItem.id);
      expect(selectedItemFieldWithPrepare.getValue()).toBe(secondItem);
    });

    it('должен корректно работать с операциями снапшота', () => {
      // Устанавливаем значение
      selectedItemField.setValue(store.items[0].id);

      // Получаем снапшот
      const snapshot = getSnapshot(store);

      // Создаем новый стор из снапшота
      const newStore = TestStore.create(snapshot);
      const newSelectedItemField = newStore.selectedItem.getField();

      // Проверяем, что ссылка сохранилась
      const value = newSelectedItemField.getValue();

      expect(value).toBeDefined();
      expect(value).toBe(newStore.items[0]);
    });
  });
});
