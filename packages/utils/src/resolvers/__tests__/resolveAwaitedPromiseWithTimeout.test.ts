/// <reference types="jest" />
import { isCanceledError } from '@krivega/cancelable-promise';

import resolveAwaitedPromiseWithTimeout from '../resolveAwaitedPromiseWithTimeout';

import type { CancelableRequest } from '@krivega/cancelable-promise';

const TIMEOUT = 1000;
const FAST_TIMEOUT = 100;

describe('resolveAwaitedPromiseWithTimeout', () => {
  let resolvePromise: (value: unknown) => void;
  let rejectPromise: (error: Error) => void;
  let createPromise: () => Promise<unknown>;
  let cancelableRequest: CancelableRequest<void, unknown>;

  beforeEach(() => {
    jest.useFakeTimers();

    createPromise = jest.fn(async () => {
      return new Promise((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
      });
    });

    cancelableRequest = resolveAwaitedPromiseWithTimeout(createPromise, TIMEOUT);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('должен резолвить промис до истечения таймаута', async () => {
    const expectedValue = 'test value';

    const promise = cancelableRequest.request();

    resolvePromise(expectedValue);

    jest.advanceTimersByTime(FAST_TIMEOUT);

    const result = await promise;

    expect(result).toBe(expectedValue);
  });

  it('должен реджектить промис до истечения таймаута', async () => {
    const rejectionError = new Error('Promise rejected');

    const promise = cancelableRequest.request();

    rejectPromise(rejectionError);

    jest.advanceTimersByTime(FAST_TIMEOUT);

    await expect(promise).rejects.toEqual(rejectionError);
  });

  it('должен реджектить с ошибкой таймаута при истечении времени', async () => {
    const promise = cancelableRequest.request();

    jest.advanceTimersByTime(TIMEOUT);

    await expect(promise).rejects.toEqual(new Error('Time is ended'));
  });

  it('должен отменять запрос и очищать таймаут', async () => {
    expect.assertions(1);

    const promise = cancelableRequest.request();

    cancelableRequest.cancelRequest();

    jest.advanceTimersByTime(TIMEOUT);

    await promise.catch((error: unknown) => {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(isCanceledError(error)).toBe(true);
    });
  });
});
