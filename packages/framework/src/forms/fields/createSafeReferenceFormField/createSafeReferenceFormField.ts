import { resolveSetter } from '@experiments/mst-tools';
import { tryReference, types } from 'mobx-state-tree';

import { createBaseFormField } from '../createFormField';

import type { IAnyModelType, ReferenceIdentifier, SnapshotIn } from 'mobx-state-tree';

export type TSafeReferenceFormField<T, E = string> = {
  getValue: () => T | undefined;
  setValue: (value?: ReferenceIdentifier) => void;
  hasDisabled: () => boolean;
  hasValid: () => boolean;
  getError: () => E | undefined;
};

const createSafeReferenceFormField = <V extends IAnyModelType>(
  ValueType: V,
  {
    initialValue,
    prepareSetValue,
  }: {
    initialValue: ReferenceIdentifier | undefined;
    prepareSetValue?: (v?: ReferenceIdentifier) => ReferenceIdentifier | undefined;
  },
) => {
  const BaseFormField = createBaseFormField(types.safeReference(ValueType), {
    initialValue,
    prepareSetValue,
  });

  const SafeReferenceFormField = BaseFormField.actions((self) => {
    const resolveSelfSetter = resolveSetter(self);
    const setValueInner = resolveSelfSetter('value');

    const setValue = (value?: ReferenceIdentifier) => {
      const valueForSet = prepareSetValue === undefined ? value : prepareSetValue(value);

      setValueInner(valueForSet);
    };

    return { setValue };
  }).views((self) => {
    const field = {
      ...self.getField(),
      getValue: () => {
        const result = tryReference(() => {
          return self.value as V;
        });

        return result as V | undefined;
      },
      setValue: (value?: ReferenceIdentifier) => {
        self.setValue(value);
      },
    };

    return {
      getField() {
        return field;
      },
    };
  });

  type TInitialState = SnapshotIn<typeof SafeReferenceFormField>;

  return types.optional(SafeReferenceFormField, {} as TInitialState);
};

export default createSafeReferenceFormField;
