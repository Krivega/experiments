/* eslint-disable @typescript-eslint/class-methods-use-this */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
abstract class AbstractSubscriber<T> {
  public abstract subscribe: (parameters: T) => void;

  public abstract unsubscribe: () => void;

  protected disposeReaction: () => void = () => {};
}

export default AbstractSubscriber;
