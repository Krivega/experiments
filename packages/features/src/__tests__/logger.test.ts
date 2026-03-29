/// <reference types="jest" />
import { debugResolve, disableDebug, enableDebug } from '../logger';

const mockEnableDebug = jest.fn();
const EXPECTED_DEBUG_CALLS_AFTER_MANUAL_ENABLE = 3;

jest.mock('debug', () => {
  const debugMocked = jest.fn();

  // @ts-expect-error
  debugMocked.enable = (debugArgument: string) => {
    mockEnableDebug(debugArgument);
  };

  return debugMocked;
});

describe('Logger', () => {
  it('enableDebug/disableDebug', () => {
    enableDebug();

    expect(mockEnableDebug).toHaveBeenCalledTimes(1);
    expect(mockEnableDebug).toHaveBeenCalledWith('@experiments/features');

    disableDebug();

    expect(mockEnableDebug).toHaveBeenCalledTimes(2);
    expect(mockEnableDebug).toHaveBeenCalledWith('-@experiments/features');

    debugResolve.enable('@experiments/features');

    expect(mockEnableDebug).toHaveBeenCalledTimes(EXPECTED_DEBUG_CALLS_AFTER_MANUAL_ENABLE);
    expect(mockEnableDebug).toHaveBeenCalledWith('@experiments/features');
  });
});
