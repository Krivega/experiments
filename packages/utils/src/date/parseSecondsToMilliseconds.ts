import { msPerSecond } from './constants';

const parseSecondsToMilliseconds = (seconds: number | undefined): number | undefined => {
  if (seconds === undefined) {
    return undefined;
  }

  return seconds * msPerSecond;
};

export default parseSecondsToMilliseconds;
