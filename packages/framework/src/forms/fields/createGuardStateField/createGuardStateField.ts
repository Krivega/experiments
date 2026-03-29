import { types } from 'mobx-state-tree';

import { createStateField } from '../createStateField';

import type { TExtractCreationType } from '@experiments/mst-tools';
import type { IAnyType, SnapshotIn } from 'mobx-state-tree';

export type TGuardStateField<T> = {
  getValue: () => T;
  setValue: (value: T) => void;
  setValueGuarded: (value: T) => boolean;
  hasDisabled: () => boolean;
};

const createGuardStateField = <V extends IAnyType>(
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
  const GuardStateFieldModel = types
    .model({
      field: createStateField(ValueType, {
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
        enable: self.field.enable,
        disable: self.field.disable,
      };
    })
    .views((self) => {
      return {
        get value() {
          return self.field.value;
        },
        get disabled() {
          return self.field.disabled;
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

  type TInitialState = SnapshotIn<typeof GuardStateFieldModel>;

  return types.optional(GuardStateFieldModel, {} as TInitialState);
};

export default createGuardStateField;
