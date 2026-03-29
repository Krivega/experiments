import { resolveSetter } from '@experiments/mst-tools';
import { tryReference, types } from 'mobx-state-tree';

import { createBaseStateField } from '../createStateField';

import type { IAnyModelType, ReferenceIdentifier, SnapshotIn } from 'mobx-state-tree';

export type TSafeReferenceStateField<T> = {
  getValue: () => T | undefined;
  setValue: (value?: ReferenceIdentifier) => void;
  hasDisabled: () => boolean;
};

const createSafeReferenceStateField = <V extends IAnyModelType>(
  ValueType: V,
  {
    initialValue,
    prepareSetValue,
  }: {
    initialValue: ReferenceIdentifier | undefined;
    prepareSetValue?: (v?: ReferenceIdentifier) => ReferenceIdentifier | undefined;
  },
) => {
  const BaseStateField = createBaseStateField(types.safeReference(ValueType), {
    prepareSetValue,
    initialValue,
  });

  const SafeReferenceStateField = BaseStateField.actions((self) => {
    const resolveSelfSetter = resolveSetter(self);
    const setValueInner = resolveSelfSetter('value');

    const setValue = (value?: ReferenceIdentifier) => {
      const valueForSet = prepareSetValue === undefined ? value : prepareSetValue(value);

      setValueInner(valueForSet);
    };

    return { setValue };
  }).views((self) => {
    const field = {
      getValue: () => {
        const result = tryReference(() => {
          return self.value as V;
        });

        return result as V | undefined;
      },
      setValue: (value?: ReferenceIdentifier) => {
        self.setValue(value);
      },
      hasDisabled: self.getField().hasDisabled,
    };

    return {
      getField() {
        return field;
      },
    };
  });

  type TInitialState = SnapshotIn<typeof SafeReferenceStateField>;

  return types.optional(SafeReferenceStateField, {} as TInitialState);
};

export default createSafeReferenceStateField;
