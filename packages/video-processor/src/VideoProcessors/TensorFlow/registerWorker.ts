const registerWorker = (workerURL: string | URL) => {
  return new Worker(workerURL);
};

export default registerWorker;
