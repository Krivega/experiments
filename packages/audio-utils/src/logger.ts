import debug from 'debug';

const NAME = '@experiments/audio-utils';

const logger = debug(NAME);

export const enableDebug = () => {
  debug.enable(NAME);
};

export const disableDebug = () => {
  debug.enable(`-${NAME}`);
};

export default logger;

export { default as debug } from 'debug';
