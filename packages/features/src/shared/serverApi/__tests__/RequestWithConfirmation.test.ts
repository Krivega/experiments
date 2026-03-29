import { flushPromises } from '@experiments/test-utils';

import RequestWithConfirmation from '../RequestWithConfirmation';

type TDeferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

const createAbortablePromise = <T>(): TDeferred<T> => {
  let resolveDeferred: ((value: T) => void) | undefined;
  let rejectDeferred: ((error: unknown) => void) | undefined;

  const promise = new Promise<T>((resolve, reject) => {
    resolveDeferred = resolve;
    rejectDeferred = reject;
  });

  return {
    promise,
    resolve: (value: T) => {
      resolveDeferred?.(value);
    },
    reject: (error: unknown) => {
      rejectDeferred?.(error);
    },
  };
};

describe('RequestWithConfirmation', () => {
  let hideConfirmation: jest.Mock;
  let showConfirmation: jest.Mock<Promise<void>, []>;
  let abort: jest.Mock;
  let request: jest.Mock;

  const createRequestWithConfirmation = () => {
    return new RequestWithConfirmation<void>({
      hideConfirmation,
      showConfirmation,
      request,
    }).execute();
  };

  beforeEach(() => {
    hideConfirmation = jest.fn();
    showConfirmation = jest.fn(async () => {});
    abort = jest.fn();
    request = jest.fn(() => {
      return { promise: Promise.resolve(undefined), abort };
    });
  });

  it('должен запускать request только после успешного showConfirmation', async () => {
    const result = createRequestWithConfirmation();

    expect(showConfirmation).toHaveBeenCalledTimes(1);
    await expect(result.promise).resolves.toBeUndefined();
    expect(request).toHaveBeenCalledTimes(1);
    expect(hideConfirmation).not.toHaveBeenCalled();
  });

  it('должен вызывать hideConfirmation при abort до завершения showConfirmation', () => {
    const pendingConfirmation = createAbortablePromise<undefined>();

    showConfirmation.mockReturnValue(pendingConfirmation.promise);

    const result = createRequestWithConfirmation();

    result.abort();

    expect(hideConfirmation).toHaveBeenCalledTimes(1);
    expect(request).not.toHaveBeenCalled();
  });

  it('должен вызывать abort request при abort после подтверждения', async () => {
    const pendingRequest = createAbortablePromise();

    request.mockReturnValue({
      promise: pendingRequest.promise,
      abort,
    });

    const result = createRequestWithConfirmation();

    await flushPromises();

    result.abort();

    expect(request).toHaveBeenCalledTimes(1);
    expect(abort).toHaveBeenCalledTimes(1);
    expect(hideConfirmation).not.toHaveBeenCalled();
  });
});
