import createRemainingTimeFormatter from './remainingTimeFormatter';
import {
  isLessThanADay,
  isLessThanAMinute,
  isLessThanAWeekOrMonth,
  isLessThanAYear,
  isLessThanAnHour,
  isPastAndOnlyInFuture,
} from './utils';

const getRemainingTime = (
  timestamp: number,
  locale: string,

  { isOnlyInFuture = false, now = Date.now() }: { isOnlyInFuture?: boolean; now?: number } = {},
): string | undefined => {
  const elapsed = timestamp - now;
  const formatter = createRemainingTimeFormatter(locale);

  if (isPastAndOnlyInFuture(elapsed, isOnlyInFuture)) {
    return formatter.formatSeconds(0);
  }

  const absoluteValueElapsed = Math.abs(elapsed);

  if (isLessThanAMinute(absoluteValueElapsed)) {
    return formatter.formatSeconds(absoluteValueElapsed);
  }

  if (isLessThanAnHour(absoluteValueElapsed)) {
    return formatter.formatMinutes(absoluteValueElapsed);
  }

  if (isLessThanADay(absoluteValueElapsed)) {
    return formatter.formatHoursAndMinutes(absoluteValueElapsed);
  }

  if (isLessThanAWeekOrMonth(absoluteValueElapsed)) {
    return formatter.formatDaysAndHours(absoluteValueElapsed);
  }

  if (isLessThanAYear(absoluteValueElapsed)) {
    return formatter.formatMonthsDaysAndHours(absoluteValueElapsed);
  }

  return undefined;
};

export default getRemainingTime;
