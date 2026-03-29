/// <reference types="jest" />
import { observable } from 'mobx';

import FormValidator from '../FormValidator';

describe('FormValidator: validators with array', () => {
  const schema = {
    items: {
      getRules: () => {
        return [
          (values: string[]) => {
            if (values.length === 0) {
              return 'required';
            }

            return undefined;
          },
        ];
      },
      actions: {
        onValid: jest.fn(),
        onError: jest.fn(),
      },
    },
  };

  const formValidator = new FormValidator(schema);

  let observableValues: { items: string[] };

  beforeEach(() => {
    observableValues = observable({
      items: ['asd'],
    });

    formValidator.subscribe({
      getStateDependence: () => {
        const { items } = observableValues;

        return { items };
      },
    });
  });

  it('should validate values immediately', () => {
    expect(schema.items.actions.onError).toHaveBeenCalledTimes(0);
    expect(schema.items.actions.onValid).toHaveBeenCalledTimes(1);
  });

  it('should not validate after unsubscribe', () => {
    jest.clearAllMocks();

    formValidator.unsubscribe();
    observableValues.items = [];

    expect(schema.items.actions.onError).toHaveBeenCalledTimes(0);
    expect(schema.items.actions.onValid).toHaveBeenCalledTimes(0);
  });

  it('should call onError when value is invalid', async () => {
    jest.clearAllMocks();

    observableValues.items = [];

    expect(schema.items.actions.onError).toHaveBeenCalledTimes(1);
    expect(schema.items.actions.onError).toHaveBeenCalledWith('required');
    expect(schema.items.actions.onValid).toHaveBeenCalledTimes(0);
  });

  it('should call onValid when value is valid', () => {
    jest.clearAllMocks();

    observableValues.items = ['value'];

    expect(schema.items.actions.onError).toHaveBeenCalledTimes(0);
    expect(schema.items.actions.onValid).toHaveBeenCalledTimes(1);
  });
});
