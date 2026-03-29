/// <reference types="jest" />
import { observable } from 'mobx';

import validateIsRequired from '../__fixtures__/validateIsRequired';
import FormValidator from '../FormValidator';

describe('FormValidator', () => {
  const schema = {
    name: {
      getRules: () => {
        return [validateIsRequired];
      },
      actions: {
        onValid: jest.fn(),
        onError: jest.fn(),
      },
    },
    password: {
      getRules: ({ isRegisteredUser }: { isRegisteredUser: boolean }) => {
        if (isRegisteredUser) {
          return [validateIsRequired];
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

  let observableValues: { name: string; password: string; isRegisteredUser: boolean };

  beforeEach(() => {
    observableValues = observable({ name: 'name', password: 'password', isRegisteredUser: true });

    formValidator.subscribe({
      getStateDependence: () => {
        const { name, password, isRegisteredUser } = observableValues;

        return { name, password, isRegisteredUser };
      },
    });
  });

  it('should validate values immediately', () => {
    expect(schema.name.actions.onError).toHaveBeenCalledTimes(0);
    expect(schema.name.actions.onValid).toHaveBeenCalledTimes(1);
  });

  it('should not validate after unsubscribe', () => {
    jest.clearAllMocks();

    formValidator.unsubscribe();
    observableValues.name = '';

    expect(schema.name.actions.onError).toHaveBeenCalledTimes(0);
    expect(schema.name.actions.onValid).toHaveBeenCalledTimes(0);
  });

  it('should call onError when value is invalid', async () => {
    jest.clearAllMocks();

    observableValues.name = '';

    expect(schema.name.actions.onError).toHaveBeenCalledTimes(1);
    expect(schema.name.actions.onError).toHaveBeenCalledWith('required');
    expect(schema.name.actions.onValid).toHaveBeenCalledTimes(0);
  });

  it('should call onValid when value is valid', () => {
    observableValues.name = '';
    jest.clearAllMocks();

    observableValues.name = 'value';

    expect(schema.name.actions.onError).toHaveBeenCalledTimes(0);
    expect(schema.name.actions.onValid).toHaveBeenCalledTimes(1);
  });

  it('should call onError when rule with two input values is invalid', async () => {
    jest.clearAllMocks();

    observableValues.isRegisteredUser = true;
    observableValues.password = '';

    expect(schema.password.actions.onError).toHaveBeenCalledTimes(1);
    expect(schema.password.actions.onError).toHaveBeenCalledWith('required');
    expect(schema.password.actions.onValid).toHaveBeenCalledTimes(0);
  });

  it('should call onValid when rule with two input values is valid', async () => {
    observableValues.isRegisteredUser = true;
    observableValues.password = '';

    jest.clearAllMocks();

    observableValues.isRegisteredUser = false;

    expect(schema.password.actions.onError).toHaveBeenCalledTimes(0);
    expect(schema.password.actions.onValid).toHaveBeenCalledTimes(1);
  });

  it('should support rules without additional rules parameters', async () => {
    const schemaWithoutAdditionalRulesParameters = {
      name: {
        getRules: () => {
          return [validateIsRequired];
        },
        actions: {
          onValid: jest.fn(),
          onError: jest.fn(),
        },
      },
    };

    const formValidatorWithoutAdditionalRulesParameters = new FormValidator(
      schemaWithoutAdditionalRulesParameters,
    );

    formValidatorWithoutAdditionalRulesParameters.subscribe({
      getStateDependence: () => {
        const { name } = observableValues;

        return { name };
      },
    });

    jest.clearAllMocks();

    observableValues.name = '';

    expect(schemaWithoutAdditionalRulesParameters.name.actions.onError).toHaveBeenCalledTimes(1);
  });
});
