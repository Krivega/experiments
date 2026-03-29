import { types } from 'mobx-state-tree';

import { createFormField } from '../createFormField';

import type { TExtractCreationType } from '@experiments/mst-tools';
import type { IAnyType, SnapshotIn } from 'mobx-state-tree';

export type TGuardFormField<T> = {
  getValue: () => T;
  setValue: (value: T) => void;
  setValueGuarded: (value: T) => boolean;
  hasValid: () => boolean;
  hasDisabled: () => boolean;
};

const createGuardFormField = <V extends IAnyType>(
  ValueType: V,
  {
    initialValue,
    canSetValue,
    prepareSetValue,
  }: {
    initialValue: TExtractCreationType<V>;
    canSetValue: (v?: TExtractCreationType<V>) => boolean;
    prepareSetValue?: (v?: TExtractCreationType<V>) => TExtractCreationType<V> | undefined;
  },
) => {
  const GuardFormFieldModel = types
    .model({
      field: createFormField(ValueType, {
        initialValue,
        prepareSetValue,
      }),
    })
    .actions((self) => {
      const setValueGuarded = (value?: TExtractCreationType<V>): void => {
        if (canSetValue(value)) {
          self.field.setValue(value);
        }
      };

      return {
        setValueGuarded,
        setValue: self.field.setValue,
        setServerError: self.field.setServerError,
        setClientError: self.field.setClientError,
        resetError: self.field.resetError,
        disable: self.field.disable,
        enable: self.field.enable,
      };
    })
    .views((self) => {
      return {
        get value() {
          return self.field.value;
        },
        get error() {
          return self.field.error;
        },
        get disabled() {
          return self.field.disabled;
        },
      };
    })
    .views((self) => {
      return {
        get isClientError(): boolean {
          return self.field.isClientError;
        },
        get isServerError(): boolean {
          return self.field.isServerError;
        },
      };
    })
    .views((self) => {
      const originalField = self.field.getField();
      const field = {
        ...originalField,
        setValueGuarded: self.setValueGuarded,
      };

      return {
        getField() {
          return field;
        },
      };
    });

  type TInitialState = SnapshotIn<typeof GuardFormFieldModel>;

  return types.optional(GuardFormFieldModel, {} as TInitialState);
};

export default createGuardFormField;
