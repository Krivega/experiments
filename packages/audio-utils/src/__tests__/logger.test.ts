/// <reference types="jest" />
import { debug, disableDebug, enableDebug } from '../index';

const mockEnableDebug = jest.fn();

jest.mock('debug', () => {
  const debugMocked = jest.fn(() => {
    const logger = jest.fn();

    // @ts-expect-error
    logger.extend = jest.fn();

    return logger;
  });

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
    expect(mockEnableDebug).toHaveBeenCalledWith('@experiments/audio-utils');

    disableDebug();

    expect(mockEnableDebug).toHaveBeenCalledTimes(2);
    expect(mockEnableDebug).toHaveBeenCalledWith('-@experiments/audio-utils');

    debug.enable('@experiments/audio-utils');

    expect(mockEnableDebug).toHaveBeenCalledTimes(3);
    expect(mockEnableDebug).toHaveBeenCalledWith('@experiments/audio-utils');
  });
});
