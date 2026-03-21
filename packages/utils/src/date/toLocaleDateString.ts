const createDate = (dateString: Date | number | string): Date | undefined => {
  let timeStamp = Number(dateString);

  if (!Number.isInteger(timeStamp)) {
    timeStamp = Number(dateString);
  }

  const date = new Date(timeStamp);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
};

const toLocaleDateString = (dateString: Date | number | string, locale?: string): string => {
  try {
    const date = createDate(dateString);

    if (!date) {
      throw new Error('Invalid Date');
    }

    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
  } catch {
    return dateString as string;
  }
};

export default toLocaleDateString;
