const MILLISECOND_MULTIPLIER = 1000;

const getFormattedDate = (
  timestampInSeconds: number,
  locale: string,
  options: Intl.DateTimeFormatOptions,
) => {
  const date = new Date(timestampInSeconds * MILLISECOND_MULTIPLIER);

  const formatter = new Intl.DateTimeFormat(locale, options);

  return formatter.format(date);
};

export default getFormattedDate;
