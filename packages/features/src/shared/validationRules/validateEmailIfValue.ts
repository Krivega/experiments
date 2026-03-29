import resolveValidateIfValue from './resolveValidateIfValue';

/** RFC 5321: локальная часть — до 64 октетов, весь адрес — до 254. */
const MAX_LOCAL_PART_LENGTH = 64;
const MAX_EMAIL_LENGTH = 254;

const emailPattern = /^[\w%+.\u0400-\u04FF-]+@[\w.\u0400-\u04FF-]+\.[A-Za-z\u0400-\u04FF]{2,}$/;

const hasValidEmail = (value: string): boolean => {
  if (value.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  const atIndex = value.indexOf('@');

  if (atIndex < 0 || atIndex > MAX_LOCAL_PART_LENGTH) {
    return false;
  }

  return emailPattern.test(value);
};

const validateEmail = (value: string): string | undefined => {
  if (hasValidEmail(value)) {
    return undefined;
  }

  return 'EMAIL_IS_NOT_VALID';
};

const validateEmailIfValue = resolveValidateIfValue(validateEmail);

export default validateEmailIfValue;
