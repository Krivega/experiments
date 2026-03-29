/* eslint-disable max-classes-per-file */

import { AbstractValidatorAction } from '../../AbstractValidatorAction';

import type { TInstance } from '../../AbstractValidatorAction/__fixtures__/MockModel';

class StringValidatorAction extends AbstractValidatorAction<TInstance, string> {
  protected init(): void {
    this.addValidator((params: string) => {
      return typeof params === 'string';
    });
  }
}

type TObjectParams = {
  id: string;
  count: number;
};

class ObjectValidatorAction extends AbstractValidatorAction<TInstance, TObjectParams> {
  protected init(): void {
    this.addValidator((params: TObjectParams) => {
      return typeof params.id === 'string' && typeof params.count === 'number';
    });
  }
}

class NumberValidatorAction extends AbstractValidatorAction<TInstance, number> {
  protected init(): void {
    this.addValidator((params: number) => {
      return typeof params === 'number' && !Number.isNaN(params);
    });
  }
}

class BooleanValidatorAction extends AbstractValidatorAction<TInstance, boolean> {
  protected init(): void {
    this.addValidator((params: boolean) => {
      return typeof params === 'boolean';
    });
  }
}

export {
  BooleanValidatorAction,
  NumberValidatorAction,
  ObjectValidatorAction,
  StringValidatorAction,
};
