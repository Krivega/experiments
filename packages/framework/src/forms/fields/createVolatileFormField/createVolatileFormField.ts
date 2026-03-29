import { resolveSetter } from '@experiments/mst-tools';
import { types } from 'mobx-state-tree';

import { ModelFormError } from '../createFormFieldDeprecated/FormError';

export type TVolatileFormField<T, E = string> = {
  getValue: () => T;
  setValue: (value: T) => void;
  getError: () => E | undefined;
  hasValid: () => boolean;
  hasDisabled: () => boolean;
};

/**
 * Создает поле формы, которое хранит значение в volatile состоянии
 * @param value - тип значения, которое не нужно сериализовать
 * @param initialValue - начальное значение
 * @param prepareSetValue - функция для подготовки значения перед установкой
 * @returns не сериализуемое поле формы
 */
const createVolatileFormField = <NonSerializableValue>({
  initialValue,
  prepareSetValue,
}: {
  initialValue: NonSerializableValue;
  prepareSetValue?: (value?: NonSerializableValue) => NonSerializableValue | undefined;
}) => {
  const ModelFormFieldVolatile = types
    .model({
      error: types.maybe(ModelFormError),
      disabled: types.optional(types.boolean, false),
    })
    .volatile(() => {
      return {
        value: initialValue as NonSerializableValue,
      };
    })
    .actions((self) => {
      const resolveSelfSetter = resolveSetter(self);
      const setValueInner = resolveSelfSetter<'value'>('value');
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

      const setValue = (value?: NonSerializableValue) => {
        const valueForSet = prepareSetValue?.(value) ?? value;

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
          return self.value;
        },
        setValue: (value?: NonSerializableValue) => {
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

  return types.optional(ModelFormFieldVolatile, {});
};

export default createVolatileFormField;
