/// <reference types="jest" />
import viewTransform from '../viewTransform';

describe('viewTransform', () => {
  let modelArray: string[];

  beforeEach(() => {
    modelArray = ['123', ''];
  });

  it('Должен вызывать функцию только при первом обращении и при изменении входных данных', () => {
    const testedFunction = jest.fn((array: string[]): string[] => {
      return array.filter(Boolean);
    });

    const transformed = viewTransform(testedFunction);

    expect(testedFunction.mock.calls.length).toBe(0);

    transformed(modelArray);

    expect(testedFunction.mock.calls.length).toBe(1);

    transformed(modelArray);

    expect(testedFunction.mock.calls.length).toBe(1);

    modelArray = [];
    transformed(modelArray);

    expect(testedFunction.mock.calls.length).toBe(2);
  });

  it('Должен возвращать одну и ту же ссылку при повторных вызовах с неизменными данными', () => {
    const testedFunction = jest.fn((array: string[]): string[] => {
      return array.filter(Boolean);
    });

    const transformed = viewTransform(testedFunction);

    const result1 = transformed(modelArray);
    const result2 = transformed(modelArray);

    expect(result1 === result2).toBe(true);

    modelArray = [];

    const result3 = transformed(modelArray);
    const result4 = transformed(modelArray);

    expect(result3 === result4).toBe(true);
    expect(result2 !== result3).toBe(true);
  });

  it('Должен использовать количество ключей объекта при отсутствии size и length', () => {
    const testedFunction = jest.fn((object: Record<string, unknown>) => {
      return Object.keys(object).length;
    });
    const transformed = viewTransform(testedFunction);
    const plainObject: Record<string, unknown> = { a: 1, b: 2 };

    const result1 = transformed(plainObject);

    expect(result1).toBe(2);
    expect(testedFunction).toHaveBeenCalledTimes(1);

    plainObject.c = 3;

    const result2 = transformed(plainObject);

    expect(result2).toBe(3);
    expect(testedFunction).toHaveBeenCalledTimes(2);
  });

  it('Должен очистить кеш после установки нового значения', () => {
    const clearSpy = jest.spyOn(Map.prototype, 'clear');
    const testedFunction = (array: string[]): string[] => {
      return array.filter(Boolean);
    };
    const transformed = viewTransform(testedFunction);
    const firstObject = ['a'];
    const secondObject = ['b'];

    transformed(firstObject);

    expect(clearSpy).toHaveBeenCalledTimes(1);

    transformed(secondObject);

    expect(clearSpy).toHaveBeenCalledTimes(2);
  });
});
