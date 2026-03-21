/// <reference types="jest" />
import { skipDuplicatedCalls as resolveSkipDuplicatedCalls } from '..';

const hasEqual = (value: number, other: number) => {
  return value === other;
};

describe('skip duplicated calls', () => {
  let action: jest.Mock;
  let actionWithSkipDuplicatedCalls: (parameters: number) => void;
  let updateParametersForSkipDuplicatedCalls: (parametersForUpdate: number) => void;

  beforeEach(() => {
    action = jest.fn();

    const { skipDuplicatedCalls, updateParams } = resolveSkipDuplicatedCalls<number>(
      action,
      hasEqual,
    );

    actionWithSkipDuplicatedCalls = skipDuplicatedCalls;
    updateParametersForSkipDuplicatedCalls = updateParams;
  });

  it('should be called 2 times when updated params', () => {
    actionWithSkipDuplicatedCalls(1);
    updateParametersForSkipDuplicatedCalls(2);
    actionWithSkipDuplicatedCalls(1);

    expect(action).toHaveBeenCalledTimes(2);
  });

  it('should not called when updated params', () => {
    updateParametersForSkipDuplicatedCalls(2);
    actionWithSkipDuplicatedCalls(2);

    expect(action).toHaveBeenCalledTimes(0);
  });

  it('should not be called with same parameters', () => {
    actionWithSkipDuplicatedCalls(1);
    actionWithSkipDuplicatedCalls(1);

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should be called function 2 times when parameter of last call is different', () => {
    actionWithSkipDuplicatedCalls(1);
    actionWithSkipDuplicatedCalls(1);
    actionWithSkipDuplicatedCalls(5);

    expect(action).toHaveBeenCalledTimes(2);
  });

  it('should be called function 3 times when parameters of all calls is different', () => {
    actionWithSkipDuplicatedCalls(1);
    actionWithSkipDuplicatedCalls(4);
    actionWithSkipDuplicatedCalls(7);

    expect(action).toHaveBeenCalledTimes(3);
  });
});
