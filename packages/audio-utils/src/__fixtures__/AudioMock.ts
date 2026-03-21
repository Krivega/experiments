class AudioMock extends Audio {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  public pause = () => {};

  public play = async () => {
    return Promise.resolve().then(() => {
      setTimeout(() => {
        this.dispatchEvent(new Event('ended'));
      }, 100);
    });
  };

  public load = () => {
    setTimeout(() => {
      this.dispatchEvent(new Event('canplaythrough'));
    }, 100);
  };
}

export default AudioMock;
