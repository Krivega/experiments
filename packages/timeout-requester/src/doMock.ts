/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const doMock = () => {
  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const moduleTimeoutRequester = jest.requireActual<typeof import('@experiments/timeout-requester')>(
    '@experiments/timeout-requester',
  );

  const originalResolveRequesterByTimeout = moduleTimeoutRequester.resolveRequesterByTimeout;

  const mockRequesterByTimeout = async () => {
    return new Promise<() => void>((resolve, reject) => {
      moduleTimeoutRequester.resolveRequesterByTimeout = (...parameters) => {
        const requesterByTimeout = originalResolveRequesterByTimeout(...parameters);
        const { start } = requesterByTimeout;

        requesterByTimeout.start = function myMock(...parametersStart) {
          start(...parametersStart);

          resolve(() => {
            return start(...parametersStart);
          });
        };

        setTimeout(reject, 1000);

        return requesterByTimeout;
      };
    });
  };

  const restoreOriginal = () => {
    moduleTimeoutRequester.resolveRequesterByTimeout = originalResolveRequesterByTimeout;
  };

  return { mockRequesterByTimeout, restoreOriginal };
};

export default doMock;
