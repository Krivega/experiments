/// <reference types="jest" />

import { observable } from 'mobx';

import whenElseAlways from '../index';

describe('whenElseAlways', () => {
  let observableObject: {
    value?: boolean | number;
  };

  beforeEach(() => {
    observableObject = observable({ value: false });
  });

  it('check whenElseAlways calls effect functions correctly', () => {
    const testedFunction1 = jest.fn();
    const testedFunction2 = jest.fn();

    whenElseAlways(
      () => {
        return observableObject.value;
      },
      testedFunction1,
      testedFunction2,
    );
    expect(testedFunction1.mock.calls.length).toBe(0);
    expect(testedFunction2.mock.calls.length).toBe(0);

    observableObject.value = true;

    expect(testedFunction1.mock.calls.length).toBe(1);
    expect(testedFunction2.mock.calls.length).toBe(0);

    observableObject.value = false;

    expect(testedFunction1.mock.calls.length).toBe(1);
    expect(testedFunction2.mock.calls.length).toBe(1);
  });

  it('check actionPrevEffect', () => {
    const actionEffectFunction = jest.fn();

    const actionEffectFunctionElse = jest.fn();

    const testedFunction1 = jest.fn(() => {
      return actionEffectFunction;
    });
    const testedFunction2 = jest.fn(() => {
      return actionEffectFunctionElse;
    });

    whenElseAlways(
      () => {
        return observableObject.value;
      },
      testedFunction1,
      testedFunction2,
    );
    expect(testedFunction1.mock.calls.length).toBe(0);
    expect(testedFunction2.mock.calls.length).toBe(0);

    observableObject.value = true;

    expect(testedFunction1.mock.calls.length).toBe(1);
    expect(testedFunction2.mock.calls.length).toBe(0);

    observableObject.value = false;

    expect(testedFunction1.mock.calls.length).toBe(1);
    expect(testedFunction2.mock.calls.length).toBe(1);

    // @ts-expect-error
    expect(testedFunction2.mock.calls[0][3]).toBe(actionEffectFunction);

    observableObject.value = true;

    expect(testedFunction1.mock.calls.length).toBe(2);
    expect(testedFunction2.mock.calls.length).toBe(1);

    // @ts-expect-error
    expect(testedFunction1.mock.calls[1][3]).toBe(actionEffectFunctionElse);
  });
});
