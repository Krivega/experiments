import type { TApiMethod } from '../serverApi/types';

export const requestWithDelay = <T = void>(
  request: () => Promise<T>,
  delayRequest: number,
): TApiMethod<T> => {
  let timeoutId: NodeJS.Timeout | undefined;

  const resultPromise = new Promise<T>((resolve, reject) => {
    timeoutId = setTimeout(() => {
      request().then(resolve).catch(reject);
    }, delayRequest);
  });

  return {
    promise: resultPromise,
    abort: () => {
      clearTimeout(timeoutId);
    },
  };
};
