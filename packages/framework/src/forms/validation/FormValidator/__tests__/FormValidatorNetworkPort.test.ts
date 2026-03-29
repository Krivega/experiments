/// <reference types="jest" />
import { observable } from 'mobx';

import FormValidator from '../FormValidator';

const validateIsRequired = (value: string | undefined): string | undefined => {
  if (value === undefined || value === '') {
    return 'FIELD_IS_REQUIRED';
  }

  return undefined;
};

const validateIp = (value?: string): string | undefined => {
  if (value !== undefined && value !== '' && value !== 'ip') {
    return 'IP_NOT_VALID';
  }

  return undefined;
};

describe('FormValidator: FormValidator in NetworkPortForm', () => {
  const schema = {
    ipAddress: {
      getRules: (stateDependence: { isGetSettingsByDHCP: boolean }) => {
        if (!stateDependence.isGetSettingsByDHCP) {
          return [validateIsRequired, validateIp];
        }

        return [];
      },
      actions: {
        onError: jest.fn(),
        onValid: jest.fn(),
      },
    },
    networkMask: {
      getRules: (stateDependence: { isGetSettingsByDHCP: boolean }) => {
        if (!stateDependence.isGetSettingsByDHCP) {
          return [validateIsRequired, validateIp];
        }

        return [];
      },
      actions: {
        onError: jest.fn(),
        onValid: jest.fn(),
      },
    },

    mtu: {
      getRules: (stateDependence: { isGetSettingsByDHCP: boolean }) => {
        if (!stateDependence.isGetSettingsByDHCP) {
          return [validateIsRequired];
        }

        return [];
      },
      actions: {
        onError: jest.fn(),
        onValid: jest.fn(),
      },
    },
  };

  const formValidator = new FormValidator(schema);

  let observableValues: {
    ipAddress: string;
    networkMask: string;
    isGetSettingsByDHCP: boolean;
    mtu: number | undefined;
  };

  beforeEach(() => {
    observableValues = observable({
      ipAddress: 'ipAddress',
      networkMask: 'networkMask',
      isGetSettingsByDHCP: false,
      mtu: undefined,
    });

    formValidator.subscribe({
      getStateDependence: () => {
        const { ipAddress, networkMask, isGetSettingsByDHCP, mtu } = observableValues;

        return { ipAddress, networkMask, isGetSettingsByDHCP, mtu };
      },
    });
  });

  it('should validate values immediately', () => {
    expect(schema.mtu.actions.onError).toHaveBeenCalledTimes(1);
    expect(schema.mtu.actions.onValid).toHaveBeenCalledTimes(0);
  });
});
