import { requestToApiMethod, hasAbortedError } from '../requestToApiMethod';

describe('requestToApiMethod', () => {
  const REQUEST_RESULT_VALUE = 42;

  it('returns an object with promise and abort', () => {
    const request = async () => {};
    const result = requestToApiMethod(request);

    expect(result).toHaveProperty('promise');
    expect(result).toHaveProperty('abort');
    expect(typeof result.abort).toBe('function');
    expect(result.promise).toBeInstanceOf(Promise);
  });

  it('invokes the request function when called', () => {
    const request = jest.fn(async () => {
      return REQUEST_RESULT_VALUE;
    });

    requestToApiMethod(request);

    expect(request).toHaveBeenCalledTimes(1);
  });

  it('resolves the returned promise with the value from the request', async () => {
    const value = { data: 'test' };
    const request = async () => {
      return value;
    };
    const { promise } = requestToApiMethod(request);

    await expect(promise).resolves.toBe(value);
  });

  it('rejects the returned promise when the request rejects', async () => {
    const error = new Error('request failed');
    const request = async () => {
      throw error;
    };
    const { promise } = requestToApiMethod(request);

    await expect(promise).rejects.toThrow('request failed');
  });

  it('cancels the promise when abort is called', async () => {
    const request = async () => {
      return new Promise<never>(() => {
        /* never resolves */
      });
    };
    const { promise, abort } = requestToApiMethod(request);

    abort();

    await expect(promise).rejects.toMatchObject({
      name: 'Canceled',
    });

    const caught = await promise.catch((error: unknown) => {
      return error as Error;
    });

    expect(hasAbortedError(caught)).toBe(true);
  });

  it('hasAbortedError returns false for non-canceled errors', () => {
    const normalError = new Error('other');

    expect(hasAbortedError(normalError)).toBe(false);
  });

  it('hasAbortedError returns true for error from canceled promise', async () => {
    const request = async () => {
      return new Promise<never>(() => {
        /* never resolves */
      });
    };
    const { promise, abort } = requestToApiMethod(request);

    abort();

    const caught = await promise.catch((error: unknown) => {
      return error as Error;
    });

    expect(hasAbortedError(caught)).toBe(true);
  });

  it('returns typed TApiMethod when request returns Promise<T>', async () => {
    const request = async () => {
      return Promise.resolve('typed') as Promise<string>;
    };
    const result = requestToApiMethod(request);

    const value: string = await result.promise;

    expect(value).toBe('typed');
  });
});
