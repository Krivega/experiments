/// <reference types="jest" />
import { observable } from 'mobx';

import FormValidator from '../FormValidator';

const validateIp = (value?: string): string | undefined => {
  if (value !== undefined && value !== '' && value !== 'ip') {
    return 'IP_NOT_VALID';
  }

  return undefined;
};

const validateIpOrUrl = (value?: string): string | undefined => {
  if (value !== undefined && value !== '' && value !== 'url or ip') {
    return 'IP_OR_URL_NOT_VALID';
  }

  return undefined;
};

describe('FormValidator: FormValidator in PresetForm', () => {
  const schema = {
    gateway: {
      getRules: () => {
        return [validateIp];
      },
      actions: {
        onError: jest.fn(),
        onValid: jest.fn(),
      },
    },
    dns: {
      getRules: () => {
        return [validateIp];
      },
      actions: {
        onError: jest.fn(),
        onValid: jest.fn(),
      },
    },
    domainName: {
      getRules: () => {
        return [validateIpOrUrl];
      },
      actions: {
        onError: jest.fn(),
        onValid: jest.fn(),
      },
    },
  };

  const formValidator = new FormValidator(schema);

  let observableValues: { gateway: string; dns: string; domainName: string };

  beforeEach(() => {
    observableValues = observable({ gateway: '', dns: '', domainName: '' });

    formValidator.subscribe({
      getStateDependence: () => {
        const { gateway, dns, domainName } = observableValues;

        return { gateway, dns, domainName };
      },
    });
  });

  it('should validate values immediately', () => {
    expect(schema.gateway.actions.onError).toHaveBeenCalledTimes(0);
    expect(schema.gateway.actions.onValid).toHaveBeenCalledTimes(1);
  });
});
