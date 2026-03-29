/// <reference types="jest" />
import { types } from 'mobx-state-tree';

import createFormField from '../createFormFieldDeprecated';

describe('createFormField', () => {
  const ModelFormField = createFormField(types.string, '');

  let formField: ReturnType<typeof ModelFormField.create>;

  beforeEach(() => {
    formField = ModelFormField.create();
  });

  it('creates a form field model with value, and error properties', () => {
    expect(formField.value).toBe('');
    expect(formField.error).toBe(undefined);
    expect(formField.isClientError).toBe(false);
    expect(formField.isServerError).toBe(false);
  });

  it('sets the value of the form field using the setValue action', () => {
    formField.setValue('new value');

    expect(formField.value).toBe('new value');
  });

  it('sets the client error of the form field using the setClientError action', () => {
    formField.setClientError('new error');

    expect(formField.error).toEqual({ value: 'new error', type: 'client' });
    expect(formField.isClientError).toBe(true);
    expect(formField.isServerError).toBe(false);
  });

  it('sets the server error of the form field using the setServerError action', () => {
    formField.setServerError('new error');

    expect(formField.error).toEqual({ value: 'new error', type: 'server' });
    expect(formField.isClientError).toBe(false);
    expect(formField.isServerError).toBe(true);
  });

  it('resets the client error of the form field using the resetError action', () => {
    formField.setClientError('new error');
    formField.resetError();

    expect(formField.error).toBeUndefined();
    expect(formField.isClientError).toBe(false);
    expect(formField.isServerError).toBe(false);
  });

  it('resets the server error of the form field using the resetError action', () => {
    formField.setServerError('new error');
    formField.resetError();

    expect(formField.error).toBeUndefined();
    expect(formField.isClientError).toBe(false);
    expect(formField.isServerError).toBe(false);
  });
});
