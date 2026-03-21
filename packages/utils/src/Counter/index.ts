class Counter {
  public count: number;

  private readonly initial: number;

  private readonly limit: number;

  public constructor({ initial = 0, limit }: { initial: number; limit: number }) {
    this.initial = initial;
    this.count = initial;
    this.limit = limit;
  }

  public increment() {
    if (this.hasLimitReached()) {
      throw new Error('Limit reached');
    }

    this.count += 1;
  }

  public reset() {
    this.count = this.initial;
  }

  public hasLimitReached(): boolean {
    return this.count >= this.limit;
  }
}

export default Counter;
