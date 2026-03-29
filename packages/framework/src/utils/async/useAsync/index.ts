import { useCallback } from 'react';

import usePromiseMachine from '../usePromiseMachine';

const useAsync = <T, P>(
  request: (parameters: P) => Promise<T>,
  { onSuccess, onFail }: { onSuccess?: (data: T) => void; onFail?: (error: string) => void } = {},
) => {
  const {
    sendIdle,
    sendPending,
    sendResolve,
    sendReject,
    response,
    isIdle,
    isPending,
    error: serverError,
  } = usePromiseMachine<T>();

  const run = useCallback(
    (requestParameters: Parameters<typeof request>[0]) => {
      sendPending();

      request(requestParameters)
        .then((_response) => {
          if (_response !== undefined && onSuccess !== undefined) {
            onSuccess(_response);
          }

          sendResolve(_response);

          return _response;
        })
        .catch((error: unknown) => {
          const requestError = error as { id: string };

          if (onFail !== undefined) {
            onFail(requestError.id);
          }

          sendReject(requestError.id);
        });
    },
    [request, sendPending, sendReject, sendResolve, onFail, onSuccess],
  );

  const resetCurrentState = useCallback(() => {
    sendIdle();
  }, [sendIdle]);

  return {
    run,
    response,
    serverError,
    resetCurrentState,
    isIdle,
    isLoading: isPending,
  };
};

export default useAsync;
