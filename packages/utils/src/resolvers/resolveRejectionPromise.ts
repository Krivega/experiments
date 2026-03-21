import { CancelableRequest } from '@krivega/cancelable-promise';

import { createTimeoutError } from './errors';

const TIMEOUT_WAIT_STATUS = 5000;

const resolveRejectionPromise = ({
  onRejected,
  timeout = TIMEOUT_WAIT_STATUS,
}: {
  onRejected?: () => void;
  timeout?: number;
}): CancelableRequest<void, never> => {
  let rejectionTimeout: NodeJS.Timeout | undefined = undefined;

  const rejectionPromise = async (): Promise<never> => {
    return new Promise<never>((_resolve, reject) => {
      rejectionTimeout = setTimeout(() => {
        reject(createTimeoutError());

        if (onRejected) {
          onRejected();
        }
      }, timeout);
    });
  };

  const cancelableRejectionPromise = new CancelableRequest<void, never>(rejectionPromise, {
    moduleName: 'cancelableRejectionPromise',
    afterCancelRequest: () => {
      if (rejectionTimeout) {
        clearTimeout(rejectionTimeout);
      }
    },
  });

  return cancelableRejectionPromise;
};

export default resolveRejectionPromise;
