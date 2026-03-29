const WEEK_DAYS_COUNT = 7;

const getWeekOfMonth = (date: Date): number => {
  const dayOfMonth = date.getDate();
  const zeroBasedDayOfMonth = dayOfMonth - 1;
  const zeroBasedWeekIndex = Math.floor(zeroBasedDayOfMonth / WEEK_DAYS_COUNT);

  return zeroBasedWeekIndex + 1;
};

export default getWeekOfMonth;
