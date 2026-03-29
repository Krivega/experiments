import { useCallback, useEffect, useRef } from 'react';

import useAsync from '../useAsync';

const useAsyncAborted = <T, P>(
  request: (params: P) => { promise: Promise<T>; abort: () => void },
  { onSuccess, onFail }: { onSuccess?: (data: T) => void; onFail?: (error: string) => void } = {},
) => {
  const abortRequest = useRef<undefined | (() => void)>(undefined);

  const requestInternal = useCallback(
    async (params: P) => {
      const { promise, abort } = request(params);

      abortRequest.current = abort;

      return promise;
    },
    [request],
  );

  useEffect(() => {
    return () => {
      abortRequest.current?.();
    };
  }, []);

  return useAsync(requestInternal, { onSuccess, onFail });
};

export default useAsyncAborted;
