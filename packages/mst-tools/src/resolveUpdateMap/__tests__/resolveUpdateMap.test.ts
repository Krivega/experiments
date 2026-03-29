/// <reference types="jest" />
import { reaction } from 'mobx';
import { types } from 'mobx-state-tree';

import resolveUpdateMap from '../index';

import type { TInstanceModel } from '../../types';

const ModelItem = types.model({
  id: types.identifier,
  value: types.maybe(types.string),
});

type TInstanceModelItem = TInstanceModel<typeof ModelItem>;

const firstItemMapMock: TInstanceModelItem = { id: '1', value: '1' };
const secondItemMapMock: TInstanceModelItem = { id: '2', value: '2' };
const thirdItemMapMock: TInstanceModelItem = { id: '3', value: '3' };
const fourthItemMapMock: TInstanceModelItem = { id: '4', value: '4' };

describe('resolveUpdateMap', () => {
  const Model = types
    .model({
      items: types.map(ModelItem),
    })
    .actions((self) => {
      return {
        updateItems(items: TInstanceModelItem[]) {
          const resolveSelfUpdateMap = resolveUpdateMap(self);

          const selfUpdateMap = resolveSelfUpdateMap<TInstanceModelItem>('items');

          selfUpdateMap(items);
        },
      };
    });

  it('должен добавлять новые элементы в map', () => {
    const instance = Model.create();

    instance.updateItems([firstItemMapMock]);

    expect([...instance.items.values()]).toEqual([firstItemMapMock]);
  });

  it('должен удалять элементы, которых нет в новом списке', () => {
    const instance = Model.create();

    instance.updateItems([firstItemMapMock, secondItemMapMock]);
    instance.updateItems([secondItemMapMock, thirdItemMapMock]);

    expect([...instance.items.values()]).toEqual([secondItemMapMock, thirdItemMapMock]);
  });

  it('должен обновлять существующие элементы', () => {
    const instance = Model.create();

    instance.updateItems([thirdItemMapMock, fourthItemMapMock]);

    const updatedFourthItem = { id: '4', value: 'обновленное значение' };

    instance.updateItems([thirdItemMapMock, updatedFourthItem]);

    expect([...instance.items.values()]).toEqual([thirdItemMapMock, updatedFourthItem]);
  });

  it('не должен обновлять свойства существующих элементов если новое значение не содержит этих полей', () => {
    const instance = Model.create();

    // Создаем элемент с нормальным значением
    instance.updateItems([thirdItemMapMock, fourthItemMapMock]);

    // Пытаемся обновить только id без поля value
    const itemWithoutValue = { id: '4' } as TInstanceModelItem;

    instance.updateItems([thirdItemMapMock, itemWithoutValue]);

    // Значение должно остаться прежним, так как spread оператор не перезаписывает существующие поля
    expect([...instance.items.values()]).toEqual([thirdItemMapMock, fourthItemMapMock]);
  });

  it('должен выполнять все три операции одновременно: удаление, обновление и добавление', () => {
    const instance = Model.create();

    // Инициализируем map с тремя элементами
    instance.updateItems([firstItemMapMock, secondItemMapMock, thirdItemMapMock]);
    expect([...instance.items.values()]).toEqual([
      firstItemMapMock,
      secondItemMapMock,
      thirdItemMapMock,
    ]);

    // Выполняем комплексное обновление:
    // - Удаляем firstItemMapMock (его нет в новом списке)
    // - Обновляем secondItemMapMock (изменяем value)
    // - Добавляем fourthItemMapMock (новый элемент)
    const updatedSecondItem = { id: '2', value: 'обновленное значение' };

    instance.updateItems([updatedSecondItem, thirdItemMapMock, fourthItemMapMock]);

    // Проверяем результат
    expect([...instance.items.values()]).toEqual([
      updatedSecondItem,
      thirdItemMapMock,
      fourthItemMapMock,
    ]);

    // Убеждаемся, что firstItemMapMock был удален
    expect(instance.items.has('1')).toBe(false);
    // Убеждаемся, что secondItemMapMock был обновлен
    expect(instance.items.get('2')).toEqual(updatedSecondItem);

    // Убеждаемся, что fourthItemMapMock был добавлен
    expect(instance.items.has('4')).toBe(true);
  });

  describe('проблемные сценарии', () => {
    it('при дубликатах id в массиве в map остаётся один элемент с данными последнего (last wins)', () => {
      const instance = Model.create();

      const duplicateFirst = { id: '1', value: 'первый' };
      const duplicateSecond = { id: '1', value: 'второй' };
      const duplicateThird = { id: '1', value: 'третий' };

      instance.updateItems([duplicateFirst, duplicateSecond, duplicateThird]);

      expect(instance.items.size).toBe(1);
      expect(instance.items.get('1')).toEqual(duplicateThird);
    });

    it('при одном вызове удаляет все лишние элементы (мутация map во время forEach)', () => {
      const instance = Model.create();

      const fiveItems = [
        { id: '1', value: '1' },
        { id: '2', value: '2' },
        { id: '3', value: '3' },
        { id: '4', value: '4' },
        { id: '5', value: '5' },
      ];

      instance.updateItems(fiveItems);
      expect(instance.items.size).toBe(5);

      instance.updateItems([
        { id: '2', value: '2' },
        { id: '4', value: '4' },
      ]);

      expect(instance.items.size).toBe(2);
      expect(instance.items.has('1')).toBe(false);
      expect(instance.items.has('2')).toBe(true);
      expect(instance.items.has('3')).toBe(false);
      expect(instance.items.has('4')).toBe(true);
      expect(instance.items.has('5')).toBe(false);
    });

    it('при передаче имени свойства, которое не map, выбрасывается ошибка', () => {
      const ModelWithNonMap = types
        .model({
          title: types.string,
          items: types.map(ModelItem),
        })
        .actions((self) => {
          return {
            updateItemsByName(name: 'title' | 'items', items: TInstanceModelItem[]) {
              const resolveSelfUpdateMap = resolveUpdateMap(self);
              const selfUpdateMap = resolveSelfUpdateMap<TInstanceModelItem>(name);

              selfUpdateMap(items);
            },
          };
        });

      const instance = ModelWithNonMap.create({ title: 'test', items: {} });

      expect(() => {
        instance.updateItemsByName('title', [firstItemMapMock]);
      }).toThrow();
    });

    it('при обновлении через map.set(id, { ...current, ...valueTarget }) с теми же данными реакция не срабатывает повторно (нет лишних вызовов)', () => {
      const instance = Model.create();

      instance.updateItems([firstItemMapMock]);

      let reactionRuns = 0;
      const dispose = reaction(
        () => {
          return instance.items.get('1');
        },
        () => {
          reactionRuns += 1;
        },
        { fireImmediately: true },
      );

      expect(reactionRuns).toBe(1);

      // Повторный вызов с теми же данными — проверяем, что лишнего срабатывания нет
      instance.updateItems([firstItemMapMock]);

      expect(reactionRuns).toBe(1);

      dispose();
    });

    it('при реальном изменении данных реакция на элемент map срабатывает', () => {
      const instance = Model.create();

      instance.updateItems([firstItemMapMock]);

      let reactionRuns = 0;
      const dispose = reaction(
        () => {
          return instance.items.get('1')?.value;
        },
        () => {
          reactionRuns += 1;
        },
        { fireImmediately: true },
      );

      expect(reactionRuns).toBe(1);

      instance.updateItems([{ id: '1', value: 'changed' }]);

      expect(reactionRuns).toBe(2);

      dispose();
    });

    it('при вызове update с элементом, для которого map.get возвращает undefined, записывает valueTarget через map.set', () => {
      const instance = Model.create();

      instance.updateItems([firstItemMapMock]);

      const originalGet = instance.items.get.bind(instance.items);
      let getCallCount = 0;

      jest.spyOn(instance.items, 'get').mockImplementation((id: string | number) => {
        getCallCount += 1;

        if (getCallCount === 2) {
          return undefined;
        }

        return originalGet(id);
      });

      instance.updateItems([firstItemMapMock]);

      expect(instance.items.get('1')).toEqual(firstItemMapMock);
    });
  });
});
