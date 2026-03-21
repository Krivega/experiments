import {
  hourPerDay,
  minutesPerHour,
  msPerDay,
  msPerHour,
  msPerMinute,
  msPerSecond,
  secondsPerMinutes,
} from './constants';

const maybeAddZeroFirst = (time: number) => {
  return `0${time}`.slice(-2);
};

const getHours = (durationMS: number, isHoursLimited: boolean) => {
  const totalHours = durationMS / msPerHour;

  if (isHoursLimited) {
    return Math.floor(totalHours % hourPerDay);
  }

  return Math.floor(totalHours);
};

const getMinutes = (durationMS: number) => {
  const minutes = Math.floor((durationMS / msPerMinute) % minutesPerHour);

  return minutes;
};

const getSeconds = (durationMS: number) => {
  const seconds = Math.floor((durationMS / msPerSecond) % secondsPerMinutes);

  return seconds;
};

const getHoursMinutesAndSeconds = (
  durationMS: number,
  isHoursLimited: boolean,
): string | undefined => {
  if (durationMS <= 0) {
    return undefined;
  }

  if (isHoursLimited && durationMS >= msPerDay) {
    return '24:00:00';
  }

  const seconds = getSeconds(durationMS);
  const minutes = getMinutes(durationMS);
  const hours = getHours(durationMS, isHoursLimited);

  return `${maybeAddZeroFirst(hours)}:${maybeAddZeroFirst(minutes)}:${maybeAddZeroFirst(seconds)}`;
};

const getMinutesAndSeconds = (durationMS: number): string | undefined => {
  if (durationMS <= 0) {
    return undefined;
  }

  if (durationMS >= msPerHour) {
    return '60:00';
  }

  const minutes = getMinutes(durationMS);
  const seconds = getSeconds(durationMS);

  return `${maybeAddZeroFirst(minutes)}:${maybeAddZeroFirst(seconds)}`;
};

const getTimer = ({
  durationMS,
  maxPeriod,
  isHoursLimited = true,
}: {
  durationMS: number;
  maxPeriod: 'hours' | 'minutes';
  isHoursLimited?: boolean;
}) => {
  if (maxPeriod === 'hours') {
    return getHoursMinutesAndSeconds(durationMS, isHoursLimited);
  }

  return getMinutesAndSeconds(durationMS);
};

export default getTimer;
