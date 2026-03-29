/// <reference types="jest" />
import {
  ObjectValidatorAction,
  StringValidatorAction,
} from '../../AbstractExecutableAction/__fixtures__/TypedValidatorAction';
import Model from '../__fixtures__/MockModel';
import AbstractValidatorAction from '../AbstractValidatorAction';

import type { TInstance } from '../__fixtures__/MockModel';

class ConcreteValidator extends AbstractValidatorAction {
  // инициализируем без добавления валидаторов
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  public init(): void {
    // noop
  }
}

describe('AbstractValidatorAction', () => {
  let instance: TInstance;
  let validator: ConcreteValidator;
  let spyInit: jest.SpyInstance;

  beforeEach(() => {
    instance = Model.create({ isValid: true });

    spyInit = jest.spyOn(ConcreteValidator.prototype, 'init');

    validator = new ConcreteValidator({ instance });
  });

  describe('Инициализация', () => {
    it('должен вызывать метод init при создании', () => {
      expect(spyInit).toHaveBeenCalledTimes(1);
    });

    it('должен содержать массив валидаторов', () => {
      // @ts-expect-error accessing protected property for testing
      expect(Array.isArray(validator.validators)).toBe(true);
    });

    it('должен инициализироваться с пустым массивом валидаторов, если не переопределен метод init', () => {
      // @ts-expect-error accessing protected property for testing
      expect(validator.validators.length).toBe(0);
    });
  });

  describe('Метод addValidator', () => {
    it('должен добавлять валидатор в массив валидаторов', () => {
      const mockValidator = jest.fn();

      validator.addValidator(mockValidator);

      // @ts-expect-error accessing protected property for testing
      const { validators } = validator;

      expect(validators).toContain(mockValidator);
      expect(validators.length).toBe(1);
    });

    it('должен добавлять несколько валидаторов в массив валидаторов', () => {
      const mockValidator1 = jest.fn();
      const mockValidator2 = jest.fn();

      validator.addValidator(mockValidator1);
      validator.addValidator(mockValidator2);

      // @ts-expect-error accessing protected property for testing
      const { validators } = validator;

      expect(validators).toContain(mockValidator1);
      expect(validators).toContain(mockValidator2);
      expect(validators.length).toBe(2);
    });
  });

  describe('Метод isValid', () => {
    it('должен возвращать true, когда не добавлено ни одного валидатора', () => {
      // @ts-expect-error accessing protected property for testing
      expect(validator.validators.length).toBe(0);
      expect(validator.isValid(undefined)).toBe(true);
    });

    it('должен возвращать true, когда все валидаторы валидны', () => {
      const mockValidValidator1 = jest.fn().mockReturnValue(true);
      const mockValidValidator2 = jest.fn().mockReturnValue(true);

      validator.addValidator(mockValidValidator1);
      validator.addValidator(mockValidValidator2);

      expect(validator.isValid(undefined)).toBe(true);
    });

    it('должен возвращать false, когда хотя бы один валидатор невалиден', () => {
      const mockValidValidator = jest.fn().mockReturnValue(true);
      const mockInvalidValidator = jest.fn().mockReturnValue(false);

      validator.addValidator(mockValidValidator);
      validator.addValidator(mockInvalidValidator);

      expect(validator.isValid(undefined)).toBe(false);
    });

    it('должен возвращать false, когда все валидаторы невалидны', () => {
      const mockInvalidValidator1 = jest.fn().mockReturnValue(false);
      const mockInvalidValidator2 = jest.fn().mockReturnValue(false);

      validator.addValidator(mockInvalidValidator1);
      validator.addValidator(mockInvalidValidator2);

      expect(validator.isValid(undefined)).toBe(false);
    });

    it('должен обрабатывать большое количество валидаторов', () => {
      // Добавляем множество валидных валидаторов
      for (let i = 0; i < 10; i++) {
        validator.addValidator(jest.fn().mockReturnValue(true));
      }

      expect(validator.isValid(undefined)).toBe(true);

      // Добавляем один невалидный
      validator.addValidator(jest.fn().mockReturnValue(false));

      expect(validator.isValid(undefined)).toBe(false);
    });

    it('должен реагировать на изменения в модели', () => {
      validator.addValidator(() => {
        return instance.isValid;
      });

      instance.setIsValid(false);
      expect(validator.isValid(undefined)).toBe(false);

      instance.setIsValid(true);
      expect(validator.isValid(undefined)).toBe(true);
    });
  });

  describe('Метод isValid с параметрами', () => {
    it('должен передавать параметры в валидаторы', () => {
      const objectValidator = new ObjectValidatorAction({ instance });
      const mockValidator = jest.fn().mockReturnValue(true);

      objectValidator.addValidator(mockValidator);

      const testParams = { id: '123', count: 42 };

      objectValidator.isValid(testParams);

      expect(mockValidator).toHaveBeenCalledWith(testParams);
    });

    it('должен работать без параметров', () => {
      const mockValidator = jest.fn().mockReturnValue(true);

      validator.addValidator(mockValidator);

      validator.isValid(undefined);

      expect(mockValidator).toHaveBeenCalledWith(undefined);
    });

    it('должен передавать параметры во все валидаторы', () => {
      const stringValidator = new StringValidatorAction({ instance });
      const mockValidator1 = jest.fn().mockReturnValue(true);
      const mockValidator2 = jest.fn().mockReturnValue(true);

      stringValidator.addValidator(mockValidator1);
      stringValidator.addValidator(mockValidator2);

      const testParams = 'test-string';

      stringValidator.isValid(testParams);

      expect(mockValidator1).toHaveBeenCalledWith(testParams);
      expect(mockValidator2).toHaveBeenCalledWith(testParams);
    });
  });
});
