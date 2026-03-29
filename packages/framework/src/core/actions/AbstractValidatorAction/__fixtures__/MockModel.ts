import { resolveSetter } from '@experiments/mst-tools';
import { types } from 'mobx-state-tree';

import type { Instance } from 'mobx-state-tree';

const Model = types
  .model({
    isValid: types.boolean,
  })
  .actions((self) => {
    const resolveSelfSetter = resolveSetter(self);
    const setIsValid = resolveSelfSetter('isValid');

    return {
      setIsValid,
    };
  });

export type TInstance = Instance<typeof Model>;

export default Model;
