import { resolveSetter } from '@experiments/mst-tools';
import { types } from 'mobx-state-tree';

import type { TExtractCreationType, TExtractValueType } from '@experiments/mst-tools';
import type { IAnyType, IOptionalIType, SnapshotIn } from 'mobx-state-tree';
import type { STNValue } from 'mobx-state-tree/dist/internal';

export type TStateField<T> = {
  getValue: () => T;
  setValue: (value: T) => void;
  hasDisabled: () => boolean;
};

export const createBaseStateField = <V extends IAnyType>(
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
      disabled: types.optional(types.boolean, false),
    })
    .actions((self) => {
      const resolveSelfSetter = resolveSetter(self);
      const setValueInner = resolveSelfSetter('value');
      const setDisabled = resolveSelfSetter('disabled');

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

      return { setValue, enable, disable };
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

const createStateField = <V extends IAnyType>(
  ValueType: V,
  {
    initialValue,
    prepareSetValue,
  }: {
    initialValue: TExtractCreationType<V>;
    prepareSetValue?: (v?: TExtractCreationType<V>) => TExtractCreationType<V> | undefined;
  },
) => {
  const BaseStateField = createBaseStateField(ValueType, { prepareSetValue, initialValue });

  type TInitialState = SnapshotIn<typeof BaseStateField>;

  return types.optional(BaseStateField, {} as TInitialState);
};

export default createStateField;
