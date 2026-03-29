/// <reference types="jest" />

import { observable } from 'mobx';

import whenAlways from '../index';

describe('whenAlways', () => {
  let observableObject: {
    value?: boolean | number;
  };
  let testedFunction = jest.fn();

  beforeEach(() => {
    observableObject = observable({ value: false });
    testedFunction = jest.fn();
    whenAlways(() => {
      return observableObject.value;
    }, testedFunction);
  });

  it('no calls effectFunction when conditionFunction returns false', () => {
    expect(testedFunction.mock.calls.length).toBe(0);
  });

  it('calls effectFunction when conditionFunction returns true', () => {
    observableObject.value = true;

    expect(testedFunction.mock.calls.length).toBe(1);
  });

  it('no calls effectFunction when conditionFunction returns false after true', () => {
    observableObject.value = true;
    observableObject.value = false;

    expect(testedFunction.mock.calls.length).toBe(1);
  });

  it('repeated calls effectFunction when conditionFunction returns true after false', () => {
    observableObject.value = true;
    observableObject.value = false;
    observableObject.value = true;

    expect(testedFunction.mock.calls.length).toBe(2);
  });

  it('repeated calls effectFunction when conditionFunction returns 2 after 1', () => {
    observableObject = observable({ value: undefined });
    testedFunction = jest.fn();
    whenAlways(() => {
      return observableObject.value;
    }, testedFunction);
    observableObject.value = 1;
    observableObject.value = 2;

    expect(testedFunction.mock.calls.length).toBe(2);
  });
});
