import { types as typesMST } from 'mobx-state-tree';

import { FieldsModel } from './Fields';

import type { TInstanceModel } from '@experiments/mst-tools';
import type { TFieldsState } from './Fields';

const Model = typesMST
  .model({
    fields: typesMST.optional(FieldsModel, {}),
  })
  .views((self) => {
    return {
      get currentState(): TFieldsState {
        return self.fields.currentState;
      },
    };
  })
  .views((self) => {
    return {
      canSave: () => {
        return self.fields.hasValid();
      },
    };
  })
  .actions((self) => {
    const reset = () => {
      self.fields.resetToRememberState();
    };

    const afterCreate = () => {
      self.fields.rememberState();
    };

    return {
      reset,

      afterCreate,
    };
  });

export type TInstance = TInstanceModel<typeof Model>;

export default Model;
