/// <reference types="jest" />
import ruleMocked from '../__fixtures__/validateIsRequired';
import FieldValidator from '../FieldValidator';

describe('FieldValidator', () => {
  const secondRuleMocked = jest.fn();
  const getRulesMocked = jest.fn(() => {
    return [ruleMocked, secondRuleMocked];
  });
  const validator = new FieldValidator(getRulesMocked);

  it('validate returns undefined when value is valid', () => {
    expect(validator.validate('value', {})).toBeUndefined();
  });

  it('validate returns error message when value is invalid', () => {
    expect(validator.validate('', {})).toBe('required');
  });

  it('should not call other rules when first rule has returned error', () => {
    validator.validate('', {});

    expect(secondRuleMocked).toHaveBeenCalledTimes(0);

    validator.validate('value', {});

    expect(secondRuleMocked).toHaveBeenCalledTimes(1);
  });

  it('should call getRules with stateDependence', () => {
    const stateDependence = {
      test: 'test',
    };

    validator.validate('value', stateDependence);

    expect(getRulesMocked).toHaveBeenCalledWith(stateDependence);
  });
});
