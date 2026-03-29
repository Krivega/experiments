import { dateUtils } from '@experiments/utils';

const millisecondsToSecondsRounded = (milliseconds: number): number => {
  return Math.round(milliseconds / dateUtils.msPerSecond);
};

export default millisecondsToSecondsRounded;
