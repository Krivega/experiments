/// <reference types="jest" />
import getErrorMessage from '../getErrorMessage';

describe('getErrorMessage', () => {
  it('должен вернуть message когда error - это Error с message', () => {
    const error = new Error('Test error message');

    const result = getErrorMessage(error);

    expect(result).toBe('Test error message');
  });

  it('должен вернуть error в строковом виде, когда error - это Error без message', () => {
    // eslint-disable-next-line unicorn/error-message
    const error = new Error();

    error.message = '';

    const result = getErrorMessage(error);

    expect(result).toBe(JSON.stringify(error));
  });

  it('должен вернуть error в строковом виде, когда error - это строка', () => {
    const error = 'String error';

    const result = getErrorMessage(error);

    expect(result).toBe(JSON.stringify(error));
  });

  it('должен вернуть error в строковом виде, когда error - это null', () => {
    // eslint-disable-next-line unicorn/no-null
    const error = null;

    const result = getErrorMessage(error);

    expect(result).toBe(JSON.stringify(error));
  });

  it('должен вернуть error в строковом виде, когда error - это undefined', () => {
    const error = undefined;

    const result = getErrorMessage(error);

    expect(result).toBe(JSON.stringify(error));
  });

  it('должен вернуть error в строковом виде, когда error - это число', () => {
    const error = 404;

    const result = getErrorMessage(error);

    expect(result).toBe(JSON.stringify(error));
  });

  it('должен вернуть error в строковом виде, когда error - это массив', () => {
    const error = ['error1', 'error2', 'error3'];

    const result = getErrorMessage(error);

    expect(result).toBe(JSON.stringify(error));
  });

  it('должен вернуть error в строковом виде, когда error - это объект с вложенными свойствами', () => {
    const error = {
      code: 500,
      details: {
        field: 'email',
        reason: 'Invalid format',
      },
    };

    const result = getErrorMessage(error);

    expect(result).toBe(JSON.stringify(error));
  });
});
