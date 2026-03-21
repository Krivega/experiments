import { msPerSecond } from './constants';
import getTimestampFromDate from './getTimestampFromDate';

const getTimestampInSecondsFromDate = (raw: string): number | undefined => {
  const time = getTimestampFromDate(raw);

  return time === undefined ? undefined : Math.floor(time / msPerSecond);
};

export default getTimestampInSecondsFromDate;
