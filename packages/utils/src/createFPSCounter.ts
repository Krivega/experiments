const createFPSCounter = () => {
  const fpsCounter = {
    sampleSize: 60,
    value: 0,
    _sample_: [] as number[],
    _index_: 0,
    _lastTick_: 0,
    tick() {
      // if is first tick, just set tick timestamp and return
      if (!this._lastTick_) {
        this._lastTick_ = performance.now();

        return 0;
      }

      // calculate necessary values to obtain current tick FPS
      const now = performance.now();
      const delta = (now - this._lastTick_) / 1000;
      const fps = 1 / delta;

      // add to fps samples, current tick fps value
      this._sample_[this._index_] = Math.round(fps);

      // iterate samples to obtain the average
      let average = 0;

      for (let i = 0; i < this._sample_.length; i++) {
        average += this._sample_[i];
      }

      average = Math.round(average / this._sample_.length);

      // set new FPS
      this.value = average;
      // store current timestamp
      this._lastTick_ = now;
      // increase sample index counter, and reset it
      // to 0 if exceded maximum sampleSize limit
      this._index_ += 1;

      if (this._index_ === this.sampleSize) this._index_ = 0;

      return this.value;
    },
  };

  return fpsCounter;
};

export default createFPSCounter;
