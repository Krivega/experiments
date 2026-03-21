const getErrorMessage = (error: unknown) => {
  const isErrorInstanceWithMessage = error instanceof Error && error.message !== '';

  if (isErrorInstanceWithMessage) {
    return error.message;
  }

  return JSON.stringify(error, undefined);
};

export default getErrorMessage;
