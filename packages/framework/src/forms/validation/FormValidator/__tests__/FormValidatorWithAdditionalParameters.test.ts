/// <reference types="jest" />
import { observable } from 'mobx';

import validateIsRequired from '../__fixtures__/validateIsRequired';
import validateIsRequiredWithAdditional from '../__fixtures__/validateIsRequiredWithAdditional';
import FormValidator from '../FormValidator';

describe('FormValidator: validators with additional parameters', () => {
  const schema = {
    profileName: {
      getRules: () => {
        return [validateIsRequired, validateIsRequiredWithAdditional];
      },
      actions: {
        onValid: jest.fn(),
        onError: jest.fn(),
      },
    },
    sipServerUrl: {
      getRules: ({ isRegisteredUser }: { isRegisteredUser: boolean }) => {
        if (isRegisteredUser) {
          return [validateIsRequired, validateIsRequiredWithAdditional];
        }

        return [];
      },
      actions: {
        onValid: jest.fn(),
        onError: jest.fn(),
      },
    },
  };

  const formValidator = new FormValidator(schema);

  let observableValues: { profileName: string; sipServerUrl: string; isRegisteredUser: boolean };

  beforeEach(() => {
    observableValues = observable({
      profileName: 'name',
      sipServerUrl: 'password',
      isRegisteredUser: true,
    });

    formValidator.subscribe({
      getStateDependence: () => {
        const { profileName, sipServerUrl, isRegisteredUser } = observableValues;

        return { profileName, sipServerUrl, isRegisteredUser };
      },
    });
  });

  it('should validate values immediately', () => {
    expect(schema.profileName.actions.onError).toHaveBeenCalledTimes(0);
    expect(schema.profileName.actions.onValid).toHaveBeenCalledTimes(1);
  });

  it('should not validate after unsubscribe', () => {
    jest.clearAllMocks();

    formValidator.unsubscribe();
    observableValues.profileName = '';

    expect(schema.profileName.actions.onError).toHaveBeenCalledTimes(0);
    expect(schema.profileName.actions.onValid).toHaveBeenCalledTimes(0);
  });

  it('should call onError when value is invalid', async () => {
    jest.clearAllMocks();

    observableValues.profileName = '';

    expect(schema.profileName.actions.onError).toHaveBeenCalledTimes(1);
    expect(schema.profileName.actions.onError).toHaveBeenCalledWith('required');
    expect(schema.profileName.actions.onValid).toHaveBeenCalledTimes(0);
  });

  it('should call onValid when value is valid', () => {
    observableValues.profileName = '';
    jest.clearAllMocks();

    observableValues.profileName = 'value';

    expect(schema.profileName.actions.onError).toHaveBeenCalledTimes(0);
    expect(schema.profileName.actions.onValid).toHaveBeenCalledTimes(1);
  });

  it('should call onError when rule with two input values is invalid', async () => {
    jest.clearAllMocks();

    observableValues.isRegisteredUser = true;
    observableValues.sipServerUrl = '';

    expect(schema.sipServerUrl.actions.onError).toHaveBeenCalledTimes(1);
    expect(schema.sipServerUrl.actions.onError).toHaveBeenCalledWith('required');
    expect(schema.sipServerUrl.actions.onValid).toHaveBeenCalledTimes(0);
  });

  it('should call onValid when rule with two input values is valid', async () => {
    observableValues.isRegisteredUser = true;
    observableValues.sipServerUrl = '';

    jest.clearAllMocks();

    observableValues.isRegisteredUser = false;

    expect(schema.sipServerUrl.actions.onError).toHaveBeenCalledTimes(0);
    expect(schema.sipServerUrl.actions.onValid).toHaveBeenCalledTimes(1);
  });
});
