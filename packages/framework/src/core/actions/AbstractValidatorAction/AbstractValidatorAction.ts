import type { IAnyModelType, Instance } from 'mobx-state-tree';

type TActionValidator<P = undefined> = (params: P) => boolean;

abstract class AbstractValidatorAction<
  T extends Instance<IAnyModelType> = Instance<IAnyModelType>,
  P = void,
> {
  protected validators: TActionValidator<P>[] = [];

  protected readonly instance: T;

  public constructor({ instance }: { instance: T }) {
    this.instance = instance;

    this.init();
  }

  public addValidator(validator: TActionValidator<P>): void {
    this.validators.push(validator);
  }

  public isValid(params: P): boolean {
    return this.validators.every((validator) => {
      return validator(params);
    });
  }

  protected abstract init(): void;
}

export default AbstractValidatorAction;
