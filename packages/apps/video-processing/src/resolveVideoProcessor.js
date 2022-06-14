import processVideo from './videoProcessor';

const worker = new Worker(new URL('./videoProcessor/worker/index', import.meta.url));

const resolveVideoProcessor = () => {
  return processVideo(worker);
};

export default resolveVideoProcessor;
