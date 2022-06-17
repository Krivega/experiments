import resolveAPI from './worker/resolveAPI';

const resolveWorkerAPI = (worker: Worker) => {
  // return { init, changeParams, processImage: memoize(processImage) };

  return resolveAPI(worker);
};

export default resolveWorkerAPI;
