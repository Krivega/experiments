const registerWorker = (workerURL) => {
  return new Worker(workerURL);
};

export default registerWorker;
