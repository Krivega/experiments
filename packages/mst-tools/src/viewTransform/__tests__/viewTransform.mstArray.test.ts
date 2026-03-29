/// <reference types="jest" />
import { TransformedItemsModel, itemsCallCounter } from '../__fixtures__/transformedModels';

describe('viewTransform', () => {
  let model: ReturnType<typeof TransformedItemsModel.create>;

  beforeEach(() => {
    model = TransformedItemsModel.create({
      itemsArray: [{ id: '1', name: 'a' }],
    });
  });

  afterEach(() => {
    itemsCallCounter.reset();
  });

  it('Должен вызывать функцию только при первом обращении и при изменении входных данных', () => {
    expect(itemsCallCounter.count).toBe(0);

    const result1 = model.transformedArrayItems;

    expect(itemsCallCounter.count).toBe(1);

    const result2 = model.transformedArrayItems;

    expect(itemsCallCounter.count).toBe(1);
    expect(result1 === result2).toBe(true);

    model.setArrayItem({ id: '2', name: 'b' });

    const result3 = model.transformedArrayItems;

    expect(itemsCallCounter.count).toBe(2);

    const result4 = model.transformedArrayItems;

    expect(itemsCallCounter.count).toBe(2);
    expect(result3 === result4).toBe(true);
    expect(result1 !== result3).toBe(true);
  });

  it('Должен возвращать одну и ту же ссылку при повторных вызовах с неизменными данными', () => {
    const result1 = model.transformedArrayItems;
    const result2 = model.transformedArrayItems;

    expect(result2).toEqual(result1);

    model.clearArrayItems();

    const result3 = model.transformedArrayItems;
    const result4 = model.transformedArrayItems;

    expect(result3 === result4).toBe(true);
    expect(result1 !== result3).toBe(true);
  });

  it('Должен очистить кеш после установки нового значения', () => {
    const clearSpy = jest.spyOn(Map.prototype, 'clear');

    expect(model.transformedArrayItems).toBeDefined();
    expect(clearSpy).toHaveBeenCalledTimes(1);

    model.setArrayItem({ id: '2', name: 'b' });

    expect(model.transformedArrayItems).toBeDefined();
    expect(clearSpy).toHaveBeenCalledTimes(2);
  });

  it('Должен возвращать разные ссылки на результат при обновлении поля у существующего элемента списка', () => {
    const result1 = model.transformedMapItems;

    model.transformedArrayItems[0].setName('new name');

    const result2 = model.transformedArrayItems;

    expect(result2[0].name).toBe('new name');
    expect(result1 !== result2).toBe(true);
  });
});
