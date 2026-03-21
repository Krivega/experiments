import { workerUtils } from '@experiments/utils';
import { memoize } from 'lodash';

memoize.Cache = WeakMap;

const resolveAPI = (worker: Worker) => {
  const init = workerUtils.resolveActionWithWaitConfirm(worker, 'init');
  const processImage = workerUtils.resolveActionWithWaitConfirm<ImageBitmap>(worker, 'process');
  const changeParams = workerUtils.resolveActionWithWaitConfirm(worker, 'changeParams');

  // memoize(processImage)
  return {
    init,
    changeParams,
    processImage: {
      sendActionAndWaitConfirm: memoize(processImage.sendActionAndWaitConfirm),
      onReceiveActionAndWaitConfirm: processImage.onReceiveActionAndWaitConfirm,
    },
  };
};

export default resolveAPI;
