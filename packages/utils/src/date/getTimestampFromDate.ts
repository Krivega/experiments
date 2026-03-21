const getTimestampFromDate = (raw: string): number | undefined => {
  const date = new Date(raw);
  const time = date.getTime();

  return Number.isNaN(time) ? undefined : time;
};

export default getTimestampFromDate;
