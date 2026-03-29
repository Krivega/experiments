import debug from 'debug';

const NAME = '@experiments/features';

const logger = debug(NAME);

export const enableDebug = () => {
  debug.enable(NAME);
};

export const disableDebug = () => {
  debug.enable(`-${NAME}`);
};

export default logger;

export { default as debugResolve } from 'debug';
