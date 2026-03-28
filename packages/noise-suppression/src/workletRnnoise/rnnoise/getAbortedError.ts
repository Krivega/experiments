const getAbortedError = (what: Error | string) => {
  let error = `Aborted(${what})`;

  error += '. Build with -sASSERTIONS for more info.';

  return new Error(error);
};

export default getAbortedError;
