/// <reference types="jest" />
/* eslint-disable jest/no-conditional-expect */
import { isCanceledError } from '@krivega/cancelable-promise';

import resolveRejectionPromise from '../resolveRejectionPromise';

import type { CancelableRequest } from '@krivega/cancelable-promise';

const TIMEOUT_REJECT = 1000;

describe('action resolveRejectionPromise', () => {
  let onRejected: jest.Mock;
  let cancelableRejectionPromise: CancelableRequest<void, never>;

  const rejectionError = new Error('Time is ended');

  beforeEach(() => {
    onRejected = jest.fn();
    cancelableRejectionPromise = resolveRejectionPromise({
      onRejected,
      timeout: TIMEOUT_REJECT,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger cancelRequest after timeout for wait', async () => {
    expect.assertions(2);

    return cancelableRejectionPromise.request().catch((error: unknown) => {
      expect(onRejected).toHaveBeenCalledTimes(1);
      expect(error).toEqual(rejectionError);
    });
  });

  it('should cancel wait rejection with canceled error', async () => {
    expect.assertions(2);

    const rejectionPromise = cancelableRejectionPromise.request();

    cancelableRejectionPromise.cancelRequest();

    return rejectionPromise.catch((error: unknown) => {
      expect(onRejected).toHaveBeenCalledTimes(0);
      expect(isCanceledError(error)).toBe(true);
    });
  });
});
