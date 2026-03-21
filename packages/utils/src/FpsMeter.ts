type TOnChange = (fps: number) => void;

const getNow = (): number => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return (performance ?? Date).now();
};

class FpsMeter {
  private beginTime: number;

  private prevTime: number;

  private frames: number;

  public constructor() {
    this.beginTime = getNow();
    this.prevTime = this.beginTime;
    this.frames = 0;
  }

  public reset() {
    this.beginTime = getNow();
    this.prevTime = this.beginTime;
    this.frames = 0;
  }

  public begin() {
    this.beginTime = getNow();
  }

  public end(onChange?: TOnChange) {
    this.frames += 1;

    const time = getNow();

    if (this.hasOneSecEnded(time)) {
      const fps = (this.frames * 1000) / (time - this.prevTime);

      onChange?.(fps);

      this.prevTime = time;
      this.frames = 0;
    }

    return time;
  }

  private hasOneSecEnded(time: number): boolean {
    return time >= this.prevTime + 1000;
  }
}

export default FpsMeter;
