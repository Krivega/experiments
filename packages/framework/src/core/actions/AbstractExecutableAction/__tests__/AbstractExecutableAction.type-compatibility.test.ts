/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/class-methods-use-this */
/* eslint-disable max-classes-per-file */
/// <reference types="jest" />

import Model from '../../AbstractValidatorAction/__fixtures__/MockModel';
import {
  BooleanValidatorAction,
  NumberValidatorAction,
  ObjectValidatorAction,
  StringValidatorAction,
} from '../__fixtures__/TypedValidatorAction';
import AbstractExecutableAction from '../AbstractExecutableAction';

import type { AbstractValidatorAction } from '../../AbstractValidatorAction';
import type { TInstance } from '../../AbstractValidatorAction/__fixtures__/MockModel';

// Утилиты для проверки типов
type Expect<T extends true> = T;
type Equal<X, Y> = (() => X) extends () => Y ? true : false;
type NotEqual<X, Y> = Equal<X, Y> extends true ? false : true;

// Тесты совместимости типов (проверяются на этапе компиляции)
type TestStringCompatibility = Expect<
  Equal<
    Parameters<StringActionWithValidator['canExecute']>[0],
    Parameters<StringValidatorAction['isValid']>[0]
  >
>;

type TestBooleanCompatibility = Expect<
  Equal<
    Parameters<BooleanActionWithValidator['canExecute']>[0],
    Parameters<BooleanValidatorAction['isValid']>[0]
  >
>;

type TestNumberCompatibility = Expect<
  Equal<
    Parameters<NumberActionWithValidator['canExecute']>[0],
    Parameters<NumberValidatorAction['isValid']>[0]
  >
>;

type TestObjectCompatibility = Expect<
  Equal<
    Parameters<ObjectActionWithValidator['canExecute']>[0],
    Parameters<ObjectValidatorAction['isValid']>[0]
  >
>;

// Тесты НЕсовместимости типов - проверяем что типы действительно разные
type TestStringNumberIncompatibility = Expect<
  NotEqual<
    Parameters<StringActionWithValidator['canExecute']>[0],
    Parameters<NumberValidatorAction['isValid']>[0]
  >
>;

type TestBooleanStringIncompatibility = Expect<
  NotEqual<
    Parameters<BooleanActionWithValidator['canExecute']>[0],
    Parameters<StringValidatorAction['isValid']>[0]
  >
>;

type TestNumberBooleanIncompatibility = Expect<
  NotEqual<
    Parameters<NumberActionWithValidator['canExecute']>[0],
    Parameters<BooleanValidatorAction['isValid']>[0]
  >
>;

type TestObjectStringIncompatibility = Expect<
  NotEqual<
    Parameters<ObjectActionWithValidator['canExecute']>[0],
    Parameters<StringValidatorAction['isValid']>[0]
  >
>;

type TObjectParams = {
  id: string;
  count: number;
};

const storeDependencies = {
  serverApi: {
    getData: async () => {
      return { id: '1', name: 'John Doe' };
    },
  },
  coreApi: {
    hideAllNotifications: () => {},
  },
};

abstract class BaseTestAction<TRunParams> extends AbstractExecutableAction<
  TInstance,
  typeof storeDependencies,
  TRunParams
> {
  public handleErrorAction = jest.fn();

  public handleErrorValidation = jest.fn();

  public handleSuccessAction = jest.fn();

  public handleFinallyAction = jest.fn();

  public beforeRun = jest.fn();

  public run(params: TRunParams) {
    return {
      promise: Promise.resolve(`Processed: ${JSON.stringify(params)}`),
      abort: jest.fn(),
    };
  }
}

abstract class BaseTestActionWithValidator<TParams> extends BaseTestAction<TParams> {
  protected abstract createValidator(): AbstractValidatorAction<TInstance, TParams>;

  protected initValidator(): void {
    this.validator = this.createValidator();
  }
}

class StringActionWithValidator extends BaseTestActionWithValidator<string> {
  protected createValidator() {
    return new StringValidatorAction({ instance: this.instance });
  }
}

class BooleanActionWithValidator extends BaseTestActionWithValidator<boolean> {
  protected createValidator() {
    return new BooleanValidatorAction({ instance: this.instance });
  }
}

class NumberActionWithValidator extends BaseTestActionWithValidator<number> {
  protected createValidator() {
    return new NumberValidatorAction({ instance: this.instance });
  }
}

class ObjectActionWithValidator extends BaseTestActionWithValidator<TObjectParams> {
  protected createValidator() {
    return new ObjectValidatorAction({ instance: this.instance });
  }
}

describe('AbstractExecutableAction: Совместимость типов', () => {
  let instance: TInstance;

  beforeEach(() => {
    instance = Model.create({ isValid: true });
  });

  describe('type safety', () => {
    describe('runtime совместимость типов', () => {
      it('должен обеспечивать совместимость string типов в runtime', () => {
        const stringAction = new StringActionWithValidator({
          instance,
          dependencies: storeDependencies,
        });

        expect(() => {
          return stringAction.canExecute('test');
        }).not.toThrow();
      });

      it('должен обеспечивать совместимость boolean типов в runtime', () => {
        const booleanAction = new BooleanActionWithValidator({
          instance,
          dependencies: storeDependencies,
        });

        expect(() => {
          return booleanAction.canExecute(true);
        }).not.toThrow();
      });

      it('должен обеспечивать совместимость number типов в runtime', () => {
        const numberAction = new NumberActionWithValidator({
          instance,
          dependencies: storeDependencies,
        });

        expect(() => {
          return numberAction.canExecute(42);
        }).not.toThrow();
      });

      it('должен обеспечивать совместимость object типов в runtime', () => {
        const objectAction = new ObjectActionWithValidator({
          instance,
          dependencies: storeDependencies,
        });

        expect(() => {
          return objectAction.canExecute({ id: 'test', count: 1 });
        }).not.toThrow();
      });
    });

    describe('совместимость одинаковых типов', () => {
      it('должен обеспечивать совместимость string типов', () => {
        const test: TestStringCompatibility = true;

        expect(test).toBe(true);
      });

      it('должен обеспечивать совместимость boolean типов', () => {
        const test: TestBooleanCompatibility = true;

        expect(test).toBe(true);
      });

      it('должен обеспечивать совместимость number типов', () => {
        const test: TestNumberCompatibility = true;

        expect(test).toBe(true);
      });

      it('должен обеспечивать совместимость object типов', () => {
        const test: TestObjectCompatibility = true;

        expect(test).toBe(true);
      });
    });

    describe('несовместимость разных типов', () => {
      it('должен предотвращать string Action с number Validator', () => {
        const test: TestStringNumberIncompatibility = true;

        expect(test).toBe(true);
      });

      it('должен предотвращать boolean Action с string Validator', () => {
        const test: TestBooleanStringIncompatibility = true;

        expect(test).toBe(true);
      });

      it('должен предотвращать number Action с boolean Validator', () => {
        const test: TestNumberBooleanIncompatibility = true;

        expect(test).toBe(true);
      });

      it('должен предотвращать object Action с string Validator', () => {
        const test: TestObjectStringIncompatibility = true;

        expect(test).toBe(true);
      });
    });
  });
});
