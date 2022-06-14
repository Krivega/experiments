import { memoize } from 'lodash';
import { resolveActionToWorker } from '../utils/worker';

memoize.Cache = WeakMap;

const resolveWorkerAPI = (worker) => {
  const init = resolveActionToWorker(worker, 'init');
  const processImage = resolveActionToWorker(worker, 'process');
  const changeParams = resolveActionToWorker(worker, 'changeParams');

  return { init, changeParams, processImage: memoize(processImage) };
};

export default resolveWorkerAPI;
