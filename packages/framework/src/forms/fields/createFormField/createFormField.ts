import { resolveSetter } from '@experiments/mst-tools';
import { types } from 'mobx-state-tree';

import { ModelFormError } from '../createFormFieldDeprecated/FormError';

import type { TExtractCreationType, TExtractValueType } from '@experiments/mst-tools';
import type { IAnyType, IOptionalIType, SnapshotIn } from 'mobx-state-tree';
import type { STNValue } from 'mobx-state-tree/dist/internal';

export type TFormField<T, E = string> = {
  getValue: () => T;
  setValue: (value: T) => void;
  getError: () => E | undefined;
  hasValid: () => boolean;
  hasDisabled: () => boolean;
};

export const createBaseFormField = <V extends IAnyType>(
  ValueType: V,
  {
    initialValue,
    prepareSetValue,
  }: {
    initialValue: TExtractCreationType<V>;
    prepareSetValue?: (v?: TExtractCreationType<V>) => TExtractCreationType<V> | undefined;
  },
) => {
  return types
    .model({
      value: types.optional(ValueType, initialValue),
      error: types.maybe(ModelFormError),
      disabled: types.optional(types.boolean, false),
    })
    .actions((self) => {
      const resolveSelfSetter = resolveSetter(self);
      const setValueInner = resolveSelfSetter('value');
      const setError = resolveSelfSetter('error');
      const setDisabled = resolveSelfSetter('disabled');

      const setServerError = (message: string) => {
        setError({ value: message, type: 'server' });
      };

      const setClientError = (message: string) => {
        setError({ value: message, type: 'client' });
      };

      const resetError = () => {
        setError(undefined);
      };

      const setValue = (value?: TExtractCreationType<V>) => {
        const valueForSet = (prepareSetValue?.(value) ?? value) as STNValue<
          V['TypeWithoutSTN'],
          IOptionalIType<V, [undefined]>
        >;

        setValueInner(valueForSet);
      };

      const enable = () => {
        setDisabled(false);
      };

      const disable = () => {
        setDisabled(true);
      };

      return { setValue, setServerError, setClientError, resetError, enable, disable };
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
    .views((self) => {
      const field = {
        getValue: () => {
          // Для reference типов возвращаем тип модели, для остальных - CreationType

          return self.value as TExtractValueType<V>;
        },
        setValue: (value?: TExtractCreationType<V>) => {
          self.setValue(value);
        },
        getError: () => {
          return self.error?.value;
        },
        hasValid: () => {
          return !self.isClientError && !self.isServerError;
        },
        hasDisabled: () => {
          return self.disabled;
        },
      };

      return {
        getField() {
          return field;
        },
      };
    });
};

const createFormField = <V extends IAnyType>(
  ValueType: V,
  {
    initialValue,
    prepareSetValue,
  }: {
    initialValue: TExtractCreationType<V>;
    prepareSetValue?: (v?: TExtractCreationType<V>) => TExtractCreationType<V> | undefined;
  },
) => {
  const BaseFormField = createBaseFormField(ValueType, { initialValue, prepareSetValue });

  type TInitialState = SnapshotIn<typeof BaseFormField>;

  return types.optional(BaseFormField, {} as TInitialState);
};

export default createFormField;
