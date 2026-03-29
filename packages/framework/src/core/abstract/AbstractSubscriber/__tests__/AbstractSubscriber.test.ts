/// <reference types="jest" />
import AbstractSubscriber from '../AbstractSubscriber';

// Mock concrete subclass of AbstractSubscriber
class ConcreteSubscriber<T> extends AbstractSubscriber<T> {
  public subscribe = jest.fn((_parameters: T) => {});

  public unsubscribe = jest.fn(() => {});
}

describe('AbstractSubscriber', () => {
  let subscriber: ConcreteSubscriber<unknown>;

  beforeEach(() => {
    subscriber = new ConcreteSubscriber();
  });

  it('should call subscribe with correct parameters', () => {
    const parameters = { test: 'test' };

    subscriber.subscribe(parameters);
    expect(subscriber.subscribe).toHaveBeenCalledWith(parameters);
  });

  it('should call unsubscribe without parameters', () => {
    subscriber.unsubscribe();
    expect(subscriber.unsubscribe).toHaveBeenCalled();
  });

  it('disposeReaction should be a function', () => {
    // @ts-expect-error
    expect(typeof subscriber.disposeReaction).toBe('function');
  });

  it('disposeReaction should not throw when called', () => {
    expect(() => {
      // @ts-expect-error
      subscriber.disposeReaction();
    }).not.toThrow();
  });
});
