/// <reference types="jest" />
import { observable } from 'mobx';

import FormValidator from '../FormValidator';

const validateIsRequired = (value: string | undefined): string | undefined => {
  if (value === undefined || value === '') {
    return 'FIELD_IS_REQUIRED';
  }

  return undefined;
};

const validateEmail = (value?: string): string | undefined => {
  if (value !== undefined && value !== '' && value !== 'email') {
    return 'EMAIL_IS_NOT_VALID';
  }

  return undefined;
};

const validatePhone = (value?: string): string | undefined => {
  if (value !== undefined && value !== '' && value !== 'phone') {
    return 'PHONE_IS_NOT_VALID';
  }

  return undefined;
};

const validateIpOrUrl = (value?: string): string | undefined => {
  if (value !== undefined && value !== '' && value !== 'url or ip') {
    return 'IP_OR_URL_NOT_VALID';
  }

  return undefined;
};

describe('FormValidator: FormValidator in MainSettingsForm', () => {
  const schema = {
    responsibleEmail: {
      getRules: () => {
        return [validateEmail];
      },
      actions: {
        onError: jest.fn(),
        onValid: jest.fn(),
      },
    },
    responsiblePhone: {
      getRules: () => {
        return [validatePhone];
      },
      actions: {
        onError: jest.fn(),
        onValid: jest.fn(),
      },
    },
    ntpAddress: {
      getRules: (stateDependence: { isUseNTP: boolean }) => {
        if (stateDependence.isUseNTP) {
          return [validateIsRequired, validateIpOrUrl];
        }

        return [];
      },
      actions: {
        onError: jest.fn(),
        onValid: jest.fn(),
      },
    },
    date: {
      getRules: (stateDependence: { isUseNTP: boolean }) => {
        if (!stateDependence.isUseNTP) {
          return [validateIsRequired];
        }

        return [];
      },

      actions: {
        onError: jest.fn(),
        onValid: jest.fn(),
      },
    },
    time: {
      getRules: (stateDependence: { isUseNTP: boolean }) => {
        if (!stateDependence.isUseNTP) {
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
    responsibleEmail: string;
    responsiblePhone: string;
    ntpAddress: string;
    isUseNTP: boolean;
    date: string;
    time: string;
  };

  beforeEach(() => {
    observableValues = observable({
      responsibleEmail: 'responsibleEmail',
      responsiblePhone: 'responsiblePhone',
      ntpAddress: 'ntpAddress',
      isUseNTP: false,
      date: 'date',
      time: 'time',
    });

    formValidator.subscribe({
      getStateDependence: () => {
        const { responsibleEmail, responsiblePhone, ntpAddress, isUseNTP, date, time } =
          observableValues;

        return { responsibleEmail, responsiblePhone, ntpAddress, isUseNTP, date, time };
      },
    });
  });

  it('should validate values immediately', () => {
    expect(schema.responsibleEmail.actions.onError).toHaveBeenCalledTimes(1);
    expect(schema.responsibleEmail.actions.onValid).toHaveBeenCalledTimes(0);
  });
});
