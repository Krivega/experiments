import { resolveSetter } from '@experiments/mst-tools';
import { types } from 'mobx-state-tree';

import { ModelFormError } from './FormError';

import type { IAnyType, OptionalDefaultValueOrFunction, SnapshotIn } from 'mobx-state-tree';

/**
 * The base model for form field.
 *
 * @deprecated Use the new model `createFormField` base class instead.
 */
const createFormFieldDeprecated = <V extends IAnyType>(
  ValueType: V,
  value?: OptionalDefaultValueOrFunction<V>,
) => {
  const ModelFormField = types
    .model({
      value: types.optional(ValueType, value),
      error: types.maybe(ModelFormError),
    })
    .views((self) => {
      return {
        get isClientError(): boolean {
          return self.error?.type === 'client';
        },

        get isServerError(): boolean {
          return self.error?.type === 'server';
        },
      };
    })
    .actions((self) => {
      const resolveSelfSetter = resolveSetter(self);
      const setValue = resolveSelfSetter('value');
      const setError = resolveSelfSetter('error');

      const setServerError = (message: string) => {
        setError({ value: message, type: 'server' });
      };

      const setClientError = (message: string) => {
        setError({ value: message, type: 'client' });
      };

      const resetError = () => {
        setError(undefined);
      };

      return { setValue, setServerError, setClientError, resetError };
    });

  type TInitialState = SnapshotIn<typeof ModelFormField>;

  return types.optional(ModelFormField, {} as TInitialState);
};

export default createFormFieldDeprecated;
