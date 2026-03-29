import { resolveGetStore } from '../core';

let indexDynamicallyName = 0;
const createWrappedStore = <
  T,
  K extends string = string,
  O extends Record<number | string, unknown> = Record<number | string, unknown>,
>(
  createStore: (options: O) => T,
  options: O = {} as O,
) => {
  indexDynamicallyName += 1;

  const dynamicallyStoreName = `dynamicallyName-${indexDynamicallyName}` as K;
  const store = createStore(options);
  const wrappedStore = {
    [dynamicallyStoreName]: store,
  } as Record<K, T>;
  const getStore = resolveGetStore<T, Record<K, T>>(dynamicallyStoreName);

  return { wrappedStore, store, getStore };
};

export default createWrappedStore;
export { getPropFromComposer, spyCreateFeatureWrapper } from '../ui/composer/__fixtures__';
