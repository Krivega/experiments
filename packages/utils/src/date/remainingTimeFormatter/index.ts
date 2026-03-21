import RemainingTimeFormatter from './RemainingTimeFormatter';

const createRemainingTimeFormatter = (locale: string) => {
  return new RemainingTimeFormatter(locale);
};

export default createRemainingTimeFormatter;
