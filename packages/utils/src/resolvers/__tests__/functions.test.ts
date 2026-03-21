import { CancelableRequest } from '@krivega/cancelable-promise';

/// <reference types="jest" />
import {
  altCombinator,
  catchResolve,
  combineCombinator,
  combineThenCombinator,
  deferred,
  finallyResolve,
  forkCombinator,
  identityCombinator,
  identityPromiseReject,
  identityPromiseResolve,
  pipe,
  promiseReject,
  promiseResolve,
  resolvePromiseFromPredicate,
  seqCombinator,
  tapCombinator,
  tapThenCatchCombinator,
  tapThenCombinator,
  thenCatchCombinator,
  thenResolve,
  unlessCombinator,
  whenCombinator,
  whenElseCombinator,
} from '../functions';

let resolvePromiseFinishRequest = () => {};

describe('functions', () => {
  it('identityCombinator', () => {
    const parameter = 'parameter';

    const value = identityCombinator(parameter);

    expect(value).toBe(parameter);
  });

  it('tapCombinator', () => {
    const callbackMocked = jest.fn();
    const value = 'value';

    const combinator = tapCombinator<string>(callbackMocked);

    const result = combinator(value);

    expect(callbackMocked).toHaveBeenCalledTimes(1);
    expect(callbackMocked).toHaveBeenCalledWith(value);
    expect(result).toBe(value);
  });

  it('whenCombinator: predicate is truthy', () => {
    const callbackMocked = jest.fn();
    const value = 'value';
    const predicate = (_parameters: string) => {
      return true;
    };

    const combinator = whenCombinator<string, undefined>(predicate, callbackMocked);

    const result = combinator(value);

    expect(callbackMocked).toHaveBeenCalledTimes(1);
    expect(callbackMocked).toHaveBeenCalledWith(value);
    expect(result).toBe(undefined);
  });

  it('whenCombinator: predicate is falsy', () => {
    const callbackMocked = jest.fn();
    const value = 'value';
    const predicate = (_parameters: string) => {
      return false;
    };

    const combinator = whenCombinator<string, undefined>(predicate, callbackMocked);

    const result = combinator(value);

    expect(callbackMocked).toHaveBeenCalledTimes(0);
    expect(result).toBe(value);
  });

  it('whenElseCombinator: predicate is truthy', () => {
    const firstCallbackMocked = jest.fn();
    const secondCallbackMocked = jest.fn();
    const value = 'value';

    const predicate = (_parameters: string) => {
      return true;
    };

    const combinator = whenElseCombinator<string, undefined>(
      predicate,
      firstCallbackMocked,
      secondCallbackMocked,
    );

    combinator(value);

    expect(firstCallbackMocked).toHaveBeenCalledTimes(1);
    expect(firstCallbackMocked).toHaveBeenCalledWith(value);
  });

  it('whenElseCombinator: predicate is falsy', () => {
    const firstCallbackMocked = jest.fn();
    const secondCallbackMocked = jest.fn();
    const value = 'value';
    const predicate = (_parameters: string) => {
      return false;
    };

    const combinator = whenElseCombinator<string, undefined>(
      predicate,
      firstCallbackMocked,
      secondCallbackMocked,
    );

    combinator(value);

    expect(secondCallbackMocked).toHaveBeenCalledTimes(1);
    expect(secondCallbackMocked).toHaveBeenCalledWith(value);
  });

  it('unlessCombinator: predicate is truthy', () => {
    const callbackMocked = jest.fn();
    const value = 'value';
    const predicate = (_parameters: string | undefined) => {
      return true;
    };

    const combinator = unlessCombinator<string, undefined>(predicate, callbackMocked);

    const result = combinator(value);

    expect(callbackMocked).toHaveBeenCalledTimes(0);
    expect(result).toBe(value);
  });

  it('unlessCombinator: predicate is falsy', () => {
    const callbackMocked = jest.fn();
    const value = 'value';

    const predicate = (_parameters: string | undefined) => {
      return false;
    };

    const combinator = unlessCombinator<string, undefined>(predicate, callbackMocked);

    const result = combinator(value);

    expect(callbackMocked).toHaveBeenCalledTimes(1);
    expect(callbackMocked).toHaveBeenCalledWith(value);
    expect(result).toBe(undefined);
  });

  it('altCombinator: first callback has returned defined value', () => {
    const value = 'value';
    const firstResult = 'firstResult';
    const secondResult = 'secondResult';

    const firstCallbackMocked = jest.fn(() => {
      return firstResult;
    });
    const secondCallbackMocked = jest.fn(() => {
      return secondResult;
    });

    const combinator = altCombinator<string, string | undefined, string | undefined>(
      firstCallbackMocked,
      secondCallbackMocked,
    );

    const result = combinator(value);

    expect(firstCallbackMocked).toHaveBeenCalledTimes(1);
    expect(firstCallbackMocked).toHaveBeenCalledWith(value);
    expect(secondCallbackMocked).toHaveBeenCalledTimes(0);
    expect(result).toBe(firstResult);
  });

  it('altCombinator: first callback has returned undefined value', () => {
    const value = 'value';
    const secondResult = 'secondResult';

    const firstCallbackMocked = jest.fn();
    const secondCallbackMocked = jest.fn(() => {
      return secondResult;
    });

    const combinator = altCombinator<string, string | undefined, string | undefined>(
      firstCallbackMocked,
      secondCallbackMocked,
    );

    const result = combinator(value);

    expect(firstCallbackMocked).toHaveBeenCalledTimes(1);
    expect(firstCallbackMocked).toHaveBeenCalledWith(value);
    expect(firstCallbackMocked).toHaveBeenCalledTimes(1);
    expect(firstCallbackMocked).toHaveBeenCalledWith(value);
    expect(result).toBe(secondResult);
  });

  it('seqCombinator', () => {
    const callbackMocked = jest.fn();

    const value = 'value';

    const combinator = seqCombinator(callbackMocked, callbackMocked, callbackMocked);

    combinator(value);

    expect(callbackMocked).toHaveBeenCalledTimes(3);
    expect(callbackMocked).toHaveBeenNthCalledWith(1, value);
    expect(callbackMocked).toHaveBeenNthCalledWith(2, value);
    expect(callbackMocked).toHaveBeenNthCalledWith(3, value);
  });

  it('forkCombinator', () => {
    const firstCallbackValue = 'firstCallbackValue';
    const secondCallbackValue = 'secondCallbackValue';

    const firstCallback = (value?: string) => {
      return firstCallbackValue + value;
    };

    const secondCallback = (value?: string) => {
      return secondCallbackValue + value;
    };
    const join = (firstValue: string, secondValue: string) => {
      return firstValue + secondValue;
    };

    const value = 'value';

    const combinator = forkCombinator(join, firstCallback, secondCallback);

    const result = combinator(value);

    expect(result).toBe(`${firstCallbackValue}${value}${secondCallbackValue}${value}`);
  });

  it('thenResolve', async () => {
    const callbackMocked = jest.fn();

    const value = 'value';

    const promise = Promise.resolve(value);

    const run = thenResolve(callbackMocked);

    await run(promise);

    expect(callbackMocked).toHaveBeenCalledOnce();
    expect(callbackMocked).toHaveBeenCalledWith(value);
  });

  it('catchResolve', async () => {
    const callbackMocked = jest.fn();

    const error = new Error('error');

    const promise = Promise.reject(error);

    const run = catchResolve(callbackMocked);

    await run(promise);

    expect(callbackMocked).toHaveBeenCalledOnce();
    expect(callbackMocked).toHaveBeenCalledWith(error);
  });

  it('finallyResolve', async () => {
    const callbackMocked = jest.fn();

    const value = 'value';

    const promise = Promise.resolve(value);

    const run = finallyResolve(callbackMocked);

    await run(promise);

    expect(callbackMocked).toHaveBeenCalledOnce();
  });

  it('promiseResolve', async () => {
    expect.assertions(3);

    const callbackResult = 'callbackResult';

    const callbackMocked = jest.fn(() => {
      return callbackResult;
    });

    const value = 'value';

    const run = promiseResolve(callbackMocked);

    await run(value).then((result) => {
      expect(callbackMocked).toHaveBeenCalledOnce();
      expect(callbackMocked).toHaveBeenCalledWith(value);
      expect(result).toBe(callbackResult);
    });
  });

  it('identityPromiseResolve', async () => {
    expect.assertions(1);

    const value = 'value';

    await identityPromiseResolve(value).then((result) => {
      expect(result).toBe(value);
    });
  });

  it('promiseReject', async () => {
    const callbackResult = 'callbackResult';

    const callbackMocked = jest.fn(() => {
      return callbackResult;
    });

    const value = 'value';

    const run = promiseReject(callbackMocked);

    let resultFromCatch = '';

    await run(value).catch((error: unknown) => {
      resultFromCatch = error as string;
    });

    expect(resultFromCatch).toBe(callbackResult);
  });

  it('identityPromiseReject', async () => {
    expect.assertions(1);

    const value = 'value';

    let resultFromCatch = '';

    await identityPromiseReject(value).catch((error: unknown) => {
      resultFromCatch = error as string;
    });

    expect(resultFromCatch).toBe(value);
  });

  it('resolvePromiseFromPredicate: predicate is truthy', async () => {
    expect.assertions(1);

    const value = 'value';
    const predicate = () => {
      return true;
    };

    const run = resolvePromiseFromPredicate(predicate);

    await run(value).then((result) => {
      expect(result).toBe(value);
    });
  });

  it('resolvePromiseFromPredicate: predicate is falsy', async () => {
    expect.assertions(1);

    const value = 'value';

    const predicate = () => {
      return false;
    };

    const run = resolvePromiseFromPredicate(predicate);

    let resultFromCatch = '';

    await run(value).catch((error: unknown) => {
      resultFromCatch = error as string;
    });

    expect(resultFromCatch).toBe(value);
  });

  it('tapThenCombinator', async () => {
    expect.assertions(1);

    const callbackResult = 'callbackResult';
    const value = 'value';

    const callback = async () => {
      return callbackResult;
    };

    const run = tapThenCombinator<string, string>(callback);

    await run(value).then((result: string) => {
      expect(result).toBe(value);
    });
  });

  it('tapThenCatchCombinator: callback has not returned an error', async () => {
    expect.assertions(2);

    const callbackResult = 'callbackResult';
    const value = 'value';

    const callback = async () => {
      return callbackResult;
    };

    const run = tapThenCatchCombinator<string, string>(callback);

    await run(value).then(({ val, isError }) => {
      expect(val).toBe(value);
      expect(isError).toBe(false);
    });
  });

  it('tapThenCatchCombinator: callback has returned an error', async () => {
    expect.assertions(2);

    const error = new Error('error');
    const value = 'value';

    const callback = async () => {
      throw error;
    };

    const run = tapThenCatchCombinator<string, string>(callback);

    await run(value).then(({ val, isError }) => {
      expect(val).toBe(value);
      expect(isError).toBe(true);
    });
  });

  it('thenCatchCombinator: callback has not returned an error', async () => {
    expect.assertions(3);

    const callbackResult = 'callbackResult';
    const value = 'value';

    const callback = async () => {
      return callbackResult;
    };

    const resolveMocked = jest.fn();
    const rejectMocked = jest.fn();

    const run = thenCatchCombinator(callback, resolveMocked, rejectMocked);

    await run(value);

    expect(resolveMocked).toHaveBeenCalledOnce();
    expect(resolveMocked).toHaveBeenCalledWith(callbackResult);
    expect(rejectMocked).toHaveBeenCalledTimes(0);
  });

  it('thenCatchCombinator: callback has returned an error', async () => {
    expect.assertions(3);

    const error = new Error('error');
    const value = 'value';

    const callback = async () => {
      throw error;
    };

    const resolveMocked = jest.fn();
    const rejectMocked = jest.fn();

    const run = thenCatchCombinator(callback, resolveMocked, rejectMocked);

    await run(value);

    expect(resolveMocked).toHaveBeenCalledTimes(0);
    expect(rejectMocked).toHaveBeenCalledOnce();
    expect(rejectMocked).toHaveBeenCalledWith(error);
  });

  it('combineCombinator', () => {
    const callbackResult = 'callbackResult';
    const value = 'value';

    const callback = () => {
      return callbackResult;
    };

    const run = combineCombinator(callback);

    const { val, valFunc } = run(value);

    expect(val).toBe(value);
    expect(valFunc).toBe(callbackResult);
  });

  it('combineThenCombinator', async () => {
    expect.assertions(2);

    const callbackResult = 'callbackResult';
    const value = 'value';

    const callback = async () => {
      return callbackResult;
    };

    const run = combineThenCombinator<string, string>(callback);

    await run(value).then(({ val, valFunc }) => {
      expect(val).toBe(value);
      expect(valFunc).toBe(callbackResult);
    });
  });

  it('pipe', () => {
    const callbackResult = 1;
    const initialValue = 5;

    const callback = (value: number) => {
      return callbackResult + value;
    };

    const run = pipe(callback, callback, callback);

    const result = run(initialValue);

    expect(result).toBe(initialValue + callbackResult * 3);
  });

  it('pipe in cancelable request', async () => {
    const oneCallStopCallbackCall = 1;
    const twoCallsStopCallbackCall = 2;

    const asyncCallback = jest.fn(async () => {});
    const syncCallback = jest.fn();
    const stopCallback = jest.fn();

    const promiseFinishRequest = new Promise<void>((resolve) => {
      resolvePromiseFinishRequest = resolve;
    });

    const request = pipe(
      asyncCallback,
      thenResolve(syncCallback),
      thenResolve(combineThenCombinator(syncCallback)),
      thenResolve(tapThenCombinator(syncCallback)),
      catchResolve(syncCallback),
      finallyResolve(() => {
        stopCallback();
        resolvePromiseFinishRequest();
      }),
    );

    const requester = new CancelableRequest<void, void>(request, {
      moduleName: 'request',
      afterCancelRequest: stopCallback,
    });

    const promise = requester.request();

    expect(stopCallback).toHaveBeenCalledTimes(0);

    requester.cancelRequest();

    expect(stopCallback).toHaveBeenCalledTimes(oneCallStopCallbackCall);

    await promise.catch(() => {});

    expect(stopCallback).toHaveBeenCalledTimes(oneCallStopCallbackCall);

    await promiseFinishRequest;

    expect(stopCallback).toHaveBeenCalledTimes(twoCallsStopCallbackCall);
  });

  it('deferred: resolve', async () => {
    const value = 'value';

    const { promise, resolve } = deferred<string>();

    resolve(value);

    const result = await promise;

    expect(result).toBe(value);
  });

  it('deferred: reject', async () => {
    const sentError = new Error('error');

    const { promise, reject } = deferred<string>();

    reject(sentError);

    let rejectedError = new Error('rejectedError');

    await promise.catch((error: unknown) => {
      rejectedError = error as Error;
    });

    expect(rejectedError).toBe(sentError);
  });
});
