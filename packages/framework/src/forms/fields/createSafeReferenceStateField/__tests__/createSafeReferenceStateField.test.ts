/// <reference types="jest" />
import { getSnapshot, types } from 'mobx-state-tree';

import { createSafeReferenceStateField } from '..';

import type { TInitialState } from '@experiments/mst-tools';

describe('createSafeReferenceStateField', () => {
  describe('базовая функциональность', () => {
    const prepareSetValue: undefined | jest.Mock = jest.fn((argument?: string) => {
      return argument;
    });

    const ItemModel = types.model({
      id: types.identifier,
      name: types.string,
    });

    const TestModel = types
      .model({
        selectedItem: createSafeReferenceStateField(ItemModel, {
          initialValue: undefined,
          prepareSetValue,
        }),
        items: types.optional(types.array(ItemModel), []),
      })
      .actions((self) => {
        return {
          replaceValues(items: TInitialState<typeof ItemModel>[]) {
            self.items.replace(items);
          },
          removeItem(index: number) {
            self.items.splice(index, 1);
          },
        };
      });

    let selectedItem: ReturnType<typeof TestModel.create>['selectedItem'];
    let instance: ReturnType<typeof TestModel.create>;

    beforeEach(() => {
      instance = TestModel.create();

      instance.replaceValues([
        { id: 'id-1', name: 'test1' },
        { id: 'ID-2', name: 'test2' },
      ]);

      selectedItem = instance.selectedItem;
    });

    it('должен инициализировать поле с начальными значениями', () => {
      expect(selectedItem.value).toBe(undefined);
      expect(selectedItem.disabled).toBe(false);
      expect(selectedItem.getField()).toHaveProperty('getValue');
      expect(selectedItem.getField()).toHaveProperty('setValue');
      expect(selectedItem.getField()).toHaveProperty('hasDisabled');
    });

    describe('метод getField', () => {
      it('должен сохранять ссылку на исходный объект при использовании getField', async () => {
        const item = instance.items[0];
        const speedCopy = selectedItem.getField();

        speedCopy.setValue(item.id);

        expect(selectedItem.getField()).toBe(speedCopy);
      });
    });

    describe('считывание значения', () => {
      it('должен получать установленное разрешимое значение через getField.getValue()', () => {
        const item = instance.items[0];

        selectedItem.setValue(item.id);

        expect(selectedItem.value).toEqual(item);
        expect(selectedItem.getField().getValue()).toEqual(item);
      });

      it('должен для неразрешимого значения возвращать undefined через getField.getValue()', () => {
        selectedItem.setValue('id-3');

        expect(selectedItem.getField().getValue()).toEqual(undefined);
      });

      it('должен получать установленное значение после того, как оно стало разрешимым', () => {
        const item = { id: 'id-3', name: 'test3' };

        selectedItem.setValue(item.id);
        instance.replaceValues([item]);

        expect(selectedItem.value).toEqual(item);
      });

      it('должен возвращать undefined для недействительной ссылки', () => {
        const item = instance.items[0];

        selectedItem.setValue(item.id);
        expect(selectedItem.value).toBe(item);

        instance.removeItem(0);

        expect(selectedItem.value).toBeUndefined();
      });
    });

    describe('установка значения', () => {
      it('должен устанавливать значение через setValue()', () => {
        const item = instance.items[0];

        selectedItem.setValue(item.id);

        expect(selectedItem.value).toEqual(item);
        expect(selectedItem.getField().getValue()).toEqual(item);
      });

      it('должен устанавливать значение через getField.setValue()', () => {
        const item = instance.items[0];

        selectedItem.getField().setValue(item.id);

        expect(selectedItem.value).toEqual(item);
        expect(selectedItem.getField().getValue()).toEqual(item);
      });
    });

    describe('подготовка значения к установке через prepareSetValue', () => {
      it('должен применять prepareSetValue при установке значения через setValue', () => {
        prepareSetValue.mockImplementationOnce((argument?: string) => {
          return argument?.toUpperCase();
        });

        selectedItem.setValue('id-2');

        expect(selectedItem.value?.id).toBe('ID-2');

        expect(prepareSetValue).toHaveBeenCalledTimes(1);
        expect(prepareSetValue).toHaveBeenCalledWith('id-2');
      });

      it('должен применять prepareSetValue, который вернет undefined', () => {
        prepareSetValue.mockImplementationOnce((_argument?: string) => {
          return undefined;
        });

        selectedItem.setValue('id-1');

        expect(selectedItem.value).toBe(undefined);

        expect(prepareSetValue).toHaveBeenCalledTimes(1);
        expect(prepareSetValue).toHaveBeenCalledWith('id-1');
      });

      it('не должен обрабатывать значение, если prepareSetValue не передана', () => {
        const TestModelWithPrepareSetValueUndefined = types
          .model({
            selectedItem: createSafeReferenceStateField(ItemModel, {
              initialValue: undefined,
              prepareSetValue: undefined,
            }),
            items: types.optional(types.array(ItemModel), []),
          })
          .actions((self) => {
            return {
              replaceValues(items: TInitialState<typeof ItemModel>[]) {
                self.items.replace(items);
              },
              removeItem(index: number) {
                self.items.splice(index, 1);
              },
            };
          });

        const instanceWithoutPrepare = TestModelWithPrepareSetValueUndefined.create();

        instanceWithoutPrepare.replaceValues([
          { id: 'id-1', name: 'test1' },
          { id: 'ID-2', name: 'test2' },
        ]);

        const selectedItemWithoutPrepare = instanceWithoutPrepare.selectedItem;

        selectedItemWithoutPrepare.setValue('id-1');

        expect(selectedItemWithoutPrepare.value?.id).toBe('id-1');

        selectedItemWithoutPrepare.setValue('ID-2');

        expect(selectedItemWithoutPrepare.value?.id).toBe('ID-2');
      });
    });

    describe('управление состоянием disabled', () => {
      it('должен управлять состоянием disabled', () => {
        expect(selectedItem.disabled).toBe(false);
        expect(selectedItem.getField().hasDisabled()).toBe(false);

        selectedItem.disable();
        expect(selectedItem.disabled).toBe(true);
        expect(selectedItem.getField().hasDisabled()).toBe(true);

        selectedItem.enable();
        expect(selectedItem.disabled).toBe(false);
        expect(selectedItem.getField().hasDisabled()).toBe(false);
      });

      it('должен сохранять состояние disabled при изменении значения', () => {
        const item = instance.items[0];

        selectedItem.setValue(item.id);
        selectedItem.disable();
        expect(selectedItem.disabled).toBe(true);

        selectedItem.setValue(item.id);
        expect(selectedItem.value).toEqual(item);
        expect(selectedItem.disabled).toBe(true);
        expect(selectedItem.getField().hasDisabled()).toBe(true);
      });
    });

    describe('работа с операциями снапшота', () => {
      it('должен работать с операциями снапшота без списка', () => {
        const item = instance.items[0];

        selectedItem.disable();
        selectedItem.setValue(item.id);

        const selectedItemSnapshot = getSnapshot(selectedItem);
        const newFormField = TestModel.create({ selectedItem: selectedItemSnapshot, items: [] });

        expect(newFormField.selectedItem.disabled).toBe(true);
        expect(newFormField.selectedItem.getField().getValue()).toBe(undefined);
        expect(newFormField.selectedItem.getField().hasDisabled()).toBe(true);
      });

      it('должен работать с операциями снапшота со списком', () => {
        const item = instance.items[0];

        selectedItem.disable();
        selectedItem.setValue(item.id);

        const snapshot = getSnapshot(instance);
        const newFormField = TestModel.create(snapshot);

        expect(newFormField.selectedItem.disabled).toBe(true);
        expect(newFormField.selectedItem.value).toEqual(item);
        expect(newFormField.selectedItem.getField().hasDisabled()).toBe(true);
      });
    });

    describe('работа с начальным значением initialValue', () => {
      let instanceWithInitialValue: ReturnType<typeof TestModelWithInitialValue.create>;

      const item = { id: 'id-1', name: 'test1' };

      const TestModelWithInitialValue = types
        .model({
          selectedItem: createSafeReferenceStateField(ItemModel, {
            initialValue: item.id,
            prepareSetValue,
          }),
          items: types.optional(types.array(ItemModel), []),
        })
        .actions((self) => {
          return {
            replaceValues(items: TInitialState<typeof ItemModel>[]) {
              self.items.replace(items);
            },
          };
        });

      beforeEach(() => {
        instanceWithInitialValue = TestModelWithInitialValue.create();
      });

      it('должен считывать разрешимое начальное значение', () => {
        instanceWithInitialValue.replaceValues([item, { id: 'ID-2', name: 'test2' }]);

        expect(instanceWithInitialValue.selectedItem.value).toEqual(item);
      });

      it('должен возвращать значение undefined для неразрешимого начального значения', () => {
        expect(instanceWithInitialValue.selectedItem.getField().getValue()).toBeUndefined();
      });
    });
  });
});
