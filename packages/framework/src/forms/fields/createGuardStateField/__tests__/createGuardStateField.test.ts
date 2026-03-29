/// <reference types="jest" />
import { getSnapshot, types } from 'mobx-state-tree';

import { createGuardStateField } from '..';

describe('createGuardStateField', () => {
  describe('базовая функциональность', () => {
    const prepareSetValue = jest.fn((argument?: string) => {
      return argument?.toUpperCase();
    });

    const ModelFormField = createGuardStateField(types.string, {
      initialValue: '',
      canSetValue: () => {
        return true;
      },
      prepareSetValue,
    });

    let formField: ReturnType<typeof ModelFormField.create>;

    beforeEach(() => {
      formField = ModelFormField.create();
    });

    it('должен инициализировать поле с начальными значениями', () => {
      expect(formField.value).toBe('');
      expect(formField.disabled).toBe(false);
      expect(formField.getField()).toHaveProperty('getValue');
      expect(formField.getField()).toHaveProperty('setValue');
      expect(formField.getField()).toHaveProperty('setValueGuarded');
      expect(formField.getField()).toHaveProperty('hasDisabled');
    });

    it('должен получать установленное значение через getField.getValue()', () => {
      formField.setValue('new value');

      expect(formField.value).toBe('NEW VALUE');
      expect(formField.getField().getValue()).toBe('NEW VALUE');
    });

    it('должен сохранять ссылку на исходный объект при использовании getField', async () => {
      const speedCopy = formField.getField();

      speedCopy.setValue('new value');

      expect(formField.getField()).toStrictEqual(speedCopy);
    });

    it('должен применять prepareSetValue при установке значения через setValue', () => {
      formField.setValue('new value');

      expect(formField.value).toBe('NEW VALUE');

      expect(prepareSetValue).toHaveBeenCalledTimes(1);
      expect(prepareSetValue).toHaveBeenCalledWith('new value');
    });

    describe('управление состоянием disabled', () => {
      it('должен управлять состоянием disabled', () => {
        expect(formField.disabled).toBe(false);
        expect(formField.getField().hasDisabled()).toBe(false);

        formField.disable();

        expect(formField.disabled).toBe(true);
        expect(formField.getField().hasDisabled()).toBe(true);

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

      it('должен работать с операциями снапшота', () => {
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
    const TestModel = types.model({
      id: types.identifier,
      name: types.string,
    });

    const TestStore = types
      .model({
        items: types.array(TestModel),
        selectedItem: createGuardStateField(types.safeReference(TestModel), {
          initialValue: undefined,
          canSetValue: (value) => {
            return value !== undefined;
          },
        }),
      })
      .actions((self) => {
        return {
          removeItem(index: number) {
            self.items.splice(index, 1);
          },
        };
      });

    let instance: typeof TestStore.Type;
    let selectedItemField: ReturnType<typeof instance.selectedItem.getField>;

    beforeEach(() => {
      instance = TestStore.create({
        items: [
          { id: '1', name: 'Item 1' },
          { id: '2', name: 'Item 2' },
        ],
        selectedItem: {},
      });
      selectedItemField = instance.selectedItem.getField();
    });

    it('должен инициализироваться с undefined значением', () => {
      expect(selectedItemField.getValue()).toBeUndefined();
    });

    it('должен устанавливать и получать значение по ссылке', () => {
      const item = instance.items[0];

      instance.selectedItem.setValue(item.id);

      expect(selectedItemField.getValue()).toBe(item);
    });

    it('должен обрабатывать недействительные ссылки', () => {
      instance.selectedItem.setValue(instance.items[0].id);

      expect(selectedItemField.getValue()).toBe(instance.items[0]);

      instance.removeItem(0);

      expect(selectedItemField.getValue()).toBeUndefined();
    });

    it('должен работать с prepareSetValue', () => {
      const TestModelWithPrepare = types.model({
        items: types.array(TestModel),
        selectedItem: createGuardStateField(types.safeReference(TestModel), {
          initialValue: undefined,
          canSetValue: (value) => {
            return value !== undefined;
          },
          prepareSetValue: (value: string | number | undefined) => {
            if (value === undefined) {
              return instance.items[0].id;
            }

            return value;
          },
        }),
      });

      const instanceWithPrepare = TestModelWithPrepare.create({
        items: [
          { id: '1', name: 'Item 1' },
          { id: '2', name: 'Item 2' },
        ],
        selectedItem: {},
      });

      const selectedItemFieldWithPrepare = instanceWithPrepare.selectedItem.getField();

      instanceWithPrepare.selectedItem.setValue(undefined);

      expect(selectedItemFieldWithPrepare.getValue()).toBe(instanceWithPrepare.items[0]);

      const secondItem = instanceWithPrepare.items[1];

      instanceWithPrepare.selectedItem.setValue(secondItem.id);

      expect(selectedItemFieldWithPrepare.getValue()).toBe(secondItem);
    });
  });

  describe('работа с canSetValue', () => {
    it('должен блокировать установку значения, если canSetValue возвращает false', () => {
      const canSetValue = jest.fn((value?: string) => {
        return value !== '';
      });

      const ModelFormField = createGuardStateField(types.string, {
        initialValue: 'initial',
        canSetValue,
      });

      const formField = ModelFormField.create();

      formField.setValue('');

      expect(formField.value).toBe('');
      expect(canSetValue).not.toHaveBeenCalled();

      formField.getField().setValueGuarded('');

      expect(formField.value).toBe('');
      expect(canSetValue).toHaveBeenCalledWith('');

      formField.getField().setValueGuarded('valid');

      expect(formField.value).toBe('valid');
      expect(canSetValue).toHaveBeenCalledWith('valid');
    });

    it('должен разрешать установку значения, если canSetValue возвращает true', () => {
      const canSetValue = jest.fn((value?: string) => {
        return value !== undefined && value.length > 2;
      });

      const ModelFormField = createGuardStateField(types.string, {
        initialValue: 'initial',
        canSetValue,
      });

      const formField = ModelFormField.create();

      formField.setValue('ab');

      expect(formField.value).toBe('ab');
      expect(canSetValue).not.toHaveBeenCalled();

      formField.getField().setValueGuarded('ab');

      expect(formField.value).toBe('ab');
      expect(canSetValue).toHaveBeenCalledWith('ab');

      formField.getField().setValueGuarded('valid');

      expect(formField.value).toBe('valid');
      expect(canSetValue).toHaveBeenCalledWith('valid');
    });

    it('должен работать в комбинации с prepareSetValue', () => {
      const canSetValue = jest.fn((value?: string) => {
        return value !== undefined && value !== '';
      });

      const prepareSetValue = jest.fn((value?: string) => {
        return value?.trim().toLowerCase();
      });

      const ModelFormField = createGuardStateField(types.string, {
        initialValue: 'initial',
        canSetValue,
        prepareSetValue,
      });

      const formField = ModelFormField.create();

      formField.setValue('123');

      expect(formField.value).toBe('123');
      expect(canSetValue).not.toHaveBeenCalled();
      expect(prepareSetValue).toHaveBeenCalledWith('123');

      // не должно измениться, так как canSetValue возвращает false
      formField.getField().setValueGuarded('');

      expect(formField.value).toBe('123');
      expect(canSetValue).toHaveBeenCalledWith('');
      expect(prepareSetValue).toHaveBeenCalledWith('123');

      formField.getField().setValueGuarded('  VALID  ');

      expect(formField.value).toBe('valid');
      expect(canSetValue).toHaveBeenCalledWith('  VALID  ');
      expect(prepareSetValue).toHaveBeenCalledWith('  VALID  ');
    });

    it('должен вызывать canSetValue перед prepareSetValue', () => {
      const callOrder: string[] = [];

      const canSetValue = jest.fn(() => {
        callOrder.push('guard');

        return true;
      });

      const prepareSetValue = jest.fn((value?: string) => {
        callOrder.push('prepare');

        return value;
      });

      const ModelFormField = createGuardStateField(types.string, {
        initialValue: 'initial',
        canSetValue,
        prepareSetValue,
      });

      const formField = ModelFormField.create();

      formField.getField().setValueGuarded('test');

      expect(callOrder).toEqual(['guard', 'prepare']);
    });
  });
});
