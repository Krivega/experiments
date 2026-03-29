/// <reference types="jest" />
import resolveGetStore from '../resolveGetStore';

describe('resolveGetStore', () => {
  it('should return the correct store value for a given store name', () => {
    const storeName = 'exampleStore';
    const store = {
      exampleStore: 'exampleValue',
    };

    const getStoreFunction = resolveGetStore<string, Record<string, string>>(storeName);
    const result = getStoreFunction(store);

    expect(result).toBe('exampleValue');
  });
});
