const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();

class ConstraintsChecked {
  public name: string;

  private readonly checkbox: HTMLInputElement;

  public constructor(name: 'echoCancellation' | 'noiseSuppression') {
    this.name = name;

    const checkbox = document.querySelector<HTMLInputElement>(`#${name}`);

    if (!checkbox) {
      throw new Error('Cannot fined checkbox');
    }

    this.checkbox = checkbox;

    if (supportedConstraints[name] === false || supportedConstraints[name] === undefined) {
      this.checkbox.disabled = true;
    }
  }

  public get checked() {
    return this.checkbox.checked;
  }
}

export default ConstraintsChecked;
