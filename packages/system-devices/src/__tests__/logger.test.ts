/// <reference types="jest" />

import { debug, disableDebug, enableDebug } from '..';

const mockEnableDebug = jest.fn();

jest.mock('debug', () => {
  const debugMocked = jest.fn();

  // @ts-expect-error
  debugMocked.enable = (arguments_: string) => {
    mockEnableDebug(arguments_);
  };

  return debugMocked;
});

describe('Logger', () => {
  it('enableDebug/disableDebug', () => {
    enableDebug();

    expect(mockEnableDebug).toHaveBeenCalledTimes(1);
    expect(mockEnableDebug).toHaveBeenCalledWith('@experiments/system-devices');

    disableDebug();

    expect(mockEnableDebug).toHaveBeenCalledTimes(2);
    expect(mockEnableDebug).toHaveBeenCalledWith('-@experiments/system-devices');

    debug.enable('@experiments/system-devices');

    expect(mockEnableDebug).toHaveBeenCalledTimes(3);
    expect(mockEnableDebug).toHaveBeenCalledWith('@experiments/system-devices');
  });
});
