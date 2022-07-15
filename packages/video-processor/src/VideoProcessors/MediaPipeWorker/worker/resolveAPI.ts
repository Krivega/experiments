import { memoize } from 'lodash';
import { resolveActionWithWaitConfirm, resolveAction } from '@experiments/utils/src/worker';
import type { TParams } from './typings';

memoize.Cache = WeakMap;

const resolveAPI = (worker: Worker) => {
  const init = resolveActionWithWaitConfirm<TParams, void>(worker, 'init');
  const processImage = resolveActionWithWaitConfirm<ImageBitmap, void>(worker, 'process');
  const changeParams = resolveActionWithWaitConfirm<TParams, void>(worker, 'changeParams');
  const result = resolveAction<ImageBitmap>(worker, 'result');

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
