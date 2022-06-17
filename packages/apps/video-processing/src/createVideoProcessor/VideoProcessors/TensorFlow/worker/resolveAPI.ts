import { memoize } from 'lodash';
import { resolveActionWithWaitConfirm } from '../../../../utils/worker';

memoize.Cache = WeakMap;

const resolveAPI = (worker: Worker) => {
  const init = resolveActionWithWaitConfirm(worker, 'init');
  const processImage = resolveActionWithWaitConfirm<ImageBitmap>(worker, 'process');
  const changeParams = resolveActionWithWaitConfirm(worker, 'changeParams');

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
