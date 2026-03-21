const relativeTime = ({
  timestamp,
  locale,
  current = Date.now(),
}: {
  timestamp: number;
  locale: string;
  current?: number;
}) => {
  const msPerSecond = 1000;
  const msPerMinute = msPerSecond * 60;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerWeek = msPerDay * 7;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = current - timestamp;

  const absoluteValueElapsed = Math.abs(elapsed);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (absoluteValueElapsed < msPerMinute) {
    return rtf.format(-Math.floor(elapsed / msPerSecond), 'seconds');
  }

  if (absoluteValueElapsed < msPerHour) {
    return rtf.format(-Math.floor(elapsed / msPerMinute), 'minutes');
  }

  if (absoluteValueElapsed < msPerDay) {
    return rtf.format(-Math.floor(elapsed / msPerHour), 'hours');
  }

  if (absoluteValueElapsed < msPerWeek) {
    return rtf.format(-Math.floor(elapsed / msPerDay), 'day');
  }

  if (absoluteValueElapsed < msPerMonth) {
    return rtf.format(-Math.floor(elapsed / msPerWeek), 'week');
  }

  if (absoluteValueElapsed < msPerYear) {
    return rtf.format(-Math.floor(elapsed / msPerMonth), 'month');
  }

  return rtf.format(-Math.floor(elapsed / msPerYear), 'year');
};

export default relativeTime;
