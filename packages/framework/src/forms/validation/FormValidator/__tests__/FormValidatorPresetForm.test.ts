/// <reference types="jest" />
import { observable } from 'mobx';

import FormValidator from '../FormValidator';

const validateIsRequired = (value?: string): string | undefined => {
  if (value === undefined || value === '') {
    return 'FIELD_IS_REQUIRED';
  }

  return undefined;
};

const validateMaxLength = (value?: string): string | undefined => {
  if (value !== undefined && value.length > 10) {
    return 'PRESET_NAME_IS_TOO_LONG';
  }

  return undefined;
};

describe('FormValidator: FormValidator in PresetForm', () => {
  const schema = {
    name: {
      getRules: () => {
        return [validateIsRequired, validateMaxLength];
      },
      actions: {
        onError: jest.fn(),
        onValid: jest.fn(),
      },
    },
    cameraId: {
      getRules: () => {
        return [validateIsRequired];
      },
      actions: {
        onError: jest.fn(),
        onValid: jest.fn(),
      },
    },
  };

  const formValidator = new FormValidator(schema);

  let observableValues: { name: string; cameraId: string };

  beforeEach(() => {
    observableValues = observable({ name: 'name', cameraId: 'cameraId' });

    formValidator.subscribe({
      getStateDependence: () => {
        const { name, cameraId } = observableValues;

        return { name, cameraId };
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
    expect(schema.name.actions.onError).toHaveBeenCalledWith('FIELD_IS_REQUIRED');
    expect(schema.name.actions.onValid).toHaveBeenCalledTimes(0);
  });

  it('should call onValid when value is valid', () => {
    observableValues.name = '';
    jest.clearAllMocks();

    observableValues.name = 'value';

    expect(schema.name.actions.onError).toHaveBeenCalledTimes(0);
    expect(schema.name.actions.onValid).toHaveBeenCalledTimes(1);
  });
});
