const TIMEOUT_ERROR_MESSAGE = 'Time is ended';

export const createTimeoutError = (): Error => {
  return new Error(TIMEOUT_ERROR_MESSAGE);
};

export const hasTimeoutError = (error: unknown): boolean => {
  return error instanceof Error && error.message === TIMEOUT_ERROR_MESSAGE;
};
