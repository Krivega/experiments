import { cancelablePromise } from '@krivega/cancelable-promise';

import type { TApiMethod } from './types';

export const requestToApiMethod = <T = void>(request: () => Promise<T>): TApiMethod<T> => {
  const promise = cancelablePromise(request());

  return {
    promise,
    abort: () => {
      promise.cancel();
    },
  };
};

export { isCanceledError as hasAbortedError } from '@krivega/cancelable-promise';
