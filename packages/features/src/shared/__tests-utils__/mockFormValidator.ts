export const unsubscribeMocked = jest.fn();

jest.mock('@experiments/framework', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const moduleActual = jest.requireActual('@experiments/framework');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  class FormValidatorMocked extends moduleActual.FormValidator {
    public unsubscribe = unsubscribeMocked;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    __esModule: true,
    ...moduleActual,
    FormValidator: FormValidatorMocked,
  };
});
