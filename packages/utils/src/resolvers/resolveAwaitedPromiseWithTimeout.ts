import { CancelableRequest } from '@krivega/cancelable-promise';

import { createTimeoutError } from './errors';

type TThenArgumentRecursive<T> = T extends PromiseLike<infer U> ? TThenArgumentRecursive<U> : T;

const resolveAwaitedPromiseWithTimeout = <T>(
  createPromise: () => Promise<TThenArgumentRecursive<T>>,
  timeout: number,
): CancelableRequest<void, T> => {
  let awaitedTimeout: NodeJS.Timeout | undefined = undefined;

  const clearAwaitedTimeout = () => {
    if (awaitedTimeout) {
      clearTimeout(awaitedTimeout);

      awaitedTimeout = undefined;
    }
  };

  const awaitedPromise = async (): Promise<TThenArgumentRecursive<T>> => {
    return new Promise<TThenArgumentRecursive<T>>((resolve, reject) => {
      awaitedTimeout = setTimeout(() => {
        reject(createTimeoutError());
      }, timeout);

      createPromise().then(resolve).catch(reject).finally(clearAwaitedTimeout);
    });
  };

  return new CancelableRequest<void, T>(awaitedPromise, {
    moduleName: 'cancelableAwaitedPromise',
    afterCancelRequest: clearAwaitedTimeout,
  });
};

export default resolveAwaitedPromiseWithTimeout;
