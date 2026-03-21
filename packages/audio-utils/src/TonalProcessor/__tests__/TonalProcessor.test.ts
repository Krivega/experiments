/// <reference types="jest" />
import { isCanceledError } from '@krivega/cancelable-promise';

import { TonalProcessor } from '../..';

import type TTonalProcessor from '..';

describe('TonalProcessor', () => {
  let tonalProcessor: TTonalProcessor;

  const HALF_SECOND = 500;

  beforeEach(() => {
    const audioContext = new AudioContext();
    const mediaStreamDestination = audioContext.createMediaStreamDestination();

    tonalProcessor = new TonalProcessor({
      audioContext,
      mediaStreamDestination,
      soundDurationInMilliseconds: HALF_SECOND,
    });
  });

  it('#1 should be sent tone', async () => {
    expect.assertions(1);

    const sendingTone = '#';

    const promise = tonalProcessor.playTone(sendingTone);

    return expect(promise).resolves.toBe(undefined);
  });

  it('#2 should be canceled playTone', async () => {
    expect.assertions(1);

    const sendingTone = '#';

    const promise = tonalProcessor.playTone(sendingTone);

    tonalProcessor.cancel();

    let rejectedError = new Error('rejectedError');

    await promise.catch((error: unknown) => {
      rejectedError = error as Error;
    });

    expect(isCanceledError(rejectedError)).toBe(true);
  });

  it('#3 should be canceled first after second playTone', async () => {
    expect.assertions(2);

    const sendingTone = '#';

    const promiseFirst = tonalProcessor.playTone(sendingTone);
    const promiseSecond = tonalProcessor.playTone(sendingTone);

    let firstRejectedError = new Error('rejectedError');

    await promiseFirst.catch((error: unknown) => {
      firstRejectedError = error as Error;
    });

    expect(isCanceledError(firstRejectedError)).toBe(true);

    return expect(promiseSecond).resolves.toBe(undefined);
  });

  it('#4 should be canceled first and second playTone', async () => {
    expect.assertions(2);

    const sendingTone = '#';

    const promiseFirst = tonalProcessor.playTone(sendingTone);
    const promiseSecond = tonalProcessor.playTone(sendingTone);

    tonalProcessor.cancel();

    let firstRejectedError = new Error('rejectedError');
    let secondRejectedError = new Error('rejectedError');

    await promiseFirst.catch((error: unknown) => {
      firstRejectedError = error as Error;
    });
    await promiseSecond.catch((error: unknown) => {
      secondRejectedError = error as Error;
    });

    expect(isCanceledError(firstRejectedError)).toBe(true);
    expect(isCanceledError(secondRejectedError)).toBe(true);
  });

  it('#5 should be disconnect buffer source when playTone has canceled', async () => {
    expect.assertions(3);

    const audioContext = new AudioContext();
    const disconnect = jest.fn();
    const { createBufferSource } = audioContext;

    audioContext.createBufferSource = () => {
      const buffer = createBufferSource.call(audioContext);

      buffer.disconnect = disconnect;

      return buffer;
    };

    const mediaStreamDestination = audioContext.createMediaStreamDestination();

    tonalProcessor = new TonalProcessor({
      audioContext,
      mediaStreamDestination,
      soundDurationInMilliseconds: HALF_SECOND,
    });

    const sendingTone = '#';

    const promiseFirst = tonalProcessor.playTone(sendingTone);
    const promiseSecond = tonalProcessor.playTone(sendingTone);

    tonalProcessor.cancel();

    let firstRejectedError = new Error('rejectedError');
    let secondRejectedError = new Error('rejectedError');

    await promiseFirst.catch((error: unknown) => {
      firstRejectedError = error as Error;
    });
    await promiseSecond.catch((error: unknown) => {
      secondRejectedError = error as Error;
    });

    expect(isCanceledError(firstRejectedError)).toBe(true);
    expect(isCanceledError(secondRejectedError)).toBe(true);

    expect(disconnect).toHaveBeenCalledTimes(2);
  });
});
