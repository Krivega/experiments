/// <reference types="jest" />
import { createWrappedStore } from '../index';

const createStore = (options: Record<number | string, unknown>) => {
  return options;
};

describe('createWrappedStore', () => {
  it('should create a wrapped store with a specific type and options', () => {
    const options = { foo: 'bar' };
    const result = createWrappedStore(createStore, options);

    expect(result.wrappedStore).toHaveProperty('dynamicallyName-1');
    expect(result.getStore).toBeDefined();
  });

  it('should create a wrapped store without options', () => {
    const result = createWrappedStore(createStore);

    expect(result.wrappedStore).toHaveProperty('dynamicallyName-2');
    expect(result.getStore).toBeDefined();
  });
});
