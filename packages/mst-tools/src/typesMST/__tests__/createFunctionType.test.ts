/// <reference types="jest" />
/* eslint-disable jest/no-conditional-expect */
import { types } from 'mobx-state-tree';

import { createFunctionType } from '../index';

describe('createFunctionType', () => {
  it('should accept a function and return a no-op function for the snapshot', () => {
    const Model = types.model({ f: createFunctionType() });
    const testFunction = jest.fn();
    const instance = Model.create({ f: testFunction });

    instance.f();

    expect(typeof instance.f).toBe('function');
    expect(instance.f).toEqual(testFunction);
    expect(testFunction).toEqual(testFunction);
    expect(testFunction).toHaveBeenCalled();
  });

  it('should accept a function with params and return a no-op function for the snapshot', () => {
    const Model = types.model({ f: createFunctionType<[string, number]>() });
    const testFunction = jest.fn();
    const instance = Model.create({ f: testFunction });

    instance.f('arg1', 1);

    expect(typeof instance.f).toBe('function');
    expect(instance.f).toEqual(testFunction);
    expect(testFunction).toEqual(testFunction);
    expect(testFunction).toHaveBeenCalledWith('arg1', 1);
  });

  it('should not accept a not function', () => {
    const Model = types.model({ f: createFunctionType() });
    const tesNotFunction = 'tesNotFunction';

    try {
      // @ts-expect-error
      Model.create({ f: tesNotFunction });
    } catch (error) {
      expect((error as Error).message).toMatch(
        "'tesNotFunction' doesn't look like a valid function)",
      );
    }
  });
});
