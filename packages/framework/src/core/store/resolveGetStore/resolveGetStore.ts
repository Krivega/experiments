import type { IAnyModelType, Instance } from 'mobx-state-tree';

const resolveGetStore = <
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  K extends Instance<IAnyModelType>,
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  storeName: keyof T,
) => {
  return (stores: T): K => {
    return stores[storeName] as K;
  };
};

export default resolveGetStore;
