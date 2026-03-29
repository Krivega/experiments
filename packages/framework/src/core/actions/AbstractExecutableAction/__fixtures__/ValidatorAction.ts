import { AbstractValidatorAction } from '../../AbstractValidatorAction';

class ValidatorAction extends AbstractValidatorAction {
  private isValidMock = true;

  public isValid(): boolean {
    return this.isValidMock;
  }

  public init(): void {
    this.isValidMock = true;
  }
}

export default ValidatorAction;
