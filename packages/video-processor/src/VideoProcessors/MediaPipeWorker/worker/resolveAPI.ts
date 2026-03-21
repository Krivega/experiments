import { workerUtils } from '@experiments/utils';
import { memoize } from 'lodash';

import type { TParams } from './typings';

memoize.Cache = WeakMap;

const resolveAPI = (worker: Worker) => {
  const init = workerUtils.resolveActionWithWaitConfirm<TParams>(worker, 'init');
  const processImage = workerUtils.resolveActionWithWaitConfirm<ImageBitmap>(worker, 'process');
  const changeParams = workerUtils.resolveActionWithWaitConfirm<TParams>(worker, 'changeParams');
  const result = workerUtils.resolveAction<ImageBitmap>(worker, 'result');

  return {
    init,
    changeParams,
    result,
    processImage: {
      sendActionAndWaitConfirm: memoize(processImage.sendActionAndWaitConfirm),
      onReceiveActionAndWaitConfirm: processImage.onReceiveActionAndWaitConfirm,
    },
  };
};

export default resolveAPI;
