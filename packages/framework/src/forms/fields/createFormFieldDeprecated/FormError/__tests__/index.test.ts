/// <reference types="jest" />
import { ModelFormError } from '..';

import type { TInstanceModelFormError } from '..';

describe('FormError', () => {
  let formErrorStore: TInstanceModelFormError;

  it('initial client error', () => {
    formErrorStore = ModelFormError.create({
      value: 'error',
      type: 'client',
    });

    expect(formErrorStore.value).toBe('error');
    expect(formErrorStore.type).toBe('client');
  });

  it('initial server error', () => {
    formErrorStore = ModelFormError.create({
      value: 'error',
      type: 'server',
    });

    expect(formErrorStore.value).toBe('error');
    expect(formErrorStore.type).toBe('server');
  });
});
