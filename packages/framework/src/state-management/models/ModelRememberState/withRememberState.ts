/**
 * Утилита для добавления функциональности запоминания состояния к MST моделям
 *
 * @example
 * ```ts
 * const BaseModel = typesMST.model({
 *   // ваши поля
 *   testField: typesMST.optional(typesMST.string, ''),
 *   isValid: typesMST.optional(typesMST.boolean, true),
 *   // дополнительные поля, которые могут быть установлены через setDependentData
 *   extraField: typesMST.optional(typesMST.string, ''),
 * }).views((self) => ({
 *   get currentState() {
 *     return {
 *       testField: self.testField,
 *       isValid: self.isValid,
 *     };
 *   }
 * })).actions((self) => {
 *   const setCurrentState = (state) => {
 *     // логика установки состояния
 *     self.testField = state.testField;
 *     self.isValid = state.isValid;
 *   };
 *
 *   const setDependentData = (data) => {
 *     // логика установки зависимых данных
 *     self.extraField = data.extraField;
 *   };
 *
 *   return {
 *     setCurrentState,
 *     setDependentData,
 *   };
 * });
 *
 * const Model = withRememberState(BaseModel);
 *
 * // Использование:
 * const instance = Model.create({});
 *
 * // Заполнение только основного состояния
 * instance.fill({ testField: 'test', isValid: true });
 *
 * // Заполнение основного состояния и зависимых данных
 * instance.fill(
 *   { testField: 'test', isValid: true },
 *   { extraField: 'extra value' }
 * );
 *
 * // Получение значения по ключу из сохраненного состояния
 * const rememberedTestField = instance.getRememberedValue('testField');
 * const rememberedIsValid = instance.getRememberedValue('isValid');
 * ```
 */

import { resolveSetter, viewTransform } from '@experiments/mst-tools';
import { isEqual } from 'lodash';
import { types as typesMST } from 'mobx-state-tree';

import type { TExtractType } from '@experiments/mst-tools';
import type { IAnyModelType } from 'mobx-state-tree';
import type { TDepends, TExtractMethodType, TExtractViewType } from '../types';

const EMPTY_DIFFS = {};

const withRememberState = <TFieldsModel extends IAnyModelType>(fieldsModel: TFieldsModel) => {
  type TFieldsInstance = TExtractType<TFieldsModel>;

  type TState = TExtractViewType<TFieldsInstance, 'currentState'>;
  type TSetCurrentStateMethod = TExtractMethodType<TFieldsInstance, 'setCurrentState'>;
  type TSetDependentDataMethod = TExtractMethodType<TFieldsInstance, 'setDependentData'>;

  const EMPTY_AFFECTED = new Set<keyof TState>([]);

  const ModelRememberState = typesMST
    .model({})
    .volatile(() => {
      return {
        _rememberedState: undefined as TState | undefined,
        isFilledRecently: false,
      };
    })
    .views((self) => {
      const transformAffectedFields = viewTransform((shallowDiff: Partial<TState>) => {
        const { depends } = self as unknown as { depends?: TDepends<TState> };

        if (!depends) {
          return EMPTY_AFFECTED;
        }

        const changedFieldKeys = Object.keys(shallowDiff) as (keyof TState)[];

        return new Set(
          changedFieldKeys.flatMap((key) => {
            return depends[key] ?? [];
          }),
        );
      });

      return {
        get rememberedState() {
          // eslint-disable-next-line no-underscore-dangle
          return self._rememberedState;
        },
        /**
         * Проверяет, что модель была заполнена и состояние сохранено
         */
        get isFilledAndRemembered(): boolean {
          return self.isFilledRecently && this.rememberedState !== undefined;
        },

        /**
         * Возвращает объект с изменившимися полями между текущим и сохраненным состоянием
         */
        get changedState(): Partial<TState> {
          const { rememberedState } = this;

          if (rememberedState === undefined || rememberedState === null) {
            return EMPTY_DIFFS;
          }

          const { currentState } = self as unknown as TFieldsInstance & { currentState: TState };

          return Object.entries(currentState as Record<string, unknown>).reduce<Partial<TState>>(
            (diff, [key, value]) => {
              return isEqual(rememberedState[key as keyof TState], value)
                ? diff
                : { ...diff, [key]: value };
            },
            EMPTY_DIFFS,
          );
        },

        /**
         * @deprecated unused
         *  возвращает Set полей, которые зависят от измененных полей (в changedState).
         */
        get affectedFields() {
          return transformAffectedFields(this.changedState);
        },

        /**
         * Получает значение по ключу из сохраненного состояния
         */
        getRememberedValue<K extends keyof TState>(key: K): TState[K] | undefined {
          const { rememberedState } = this;

          if (rememberedState === undefined || rememberedState === null) {
            return undefined;
          }

          return rememberedState[key];
        },

        /**
         * Проверяет равенство текущего и сохраненного состояния
         */
        hasEqualState(): boolean {
          if (this.rememberedState === undefined) {
            return true;
          }

          return Object.keys(this.changedState).length === 0;
        },
      };
    })
    .actions((self) => {
      const resolveSelfSetter = resolveSetter(self);
      const setRememberedState = resolveSelfSetter<'_rememberedState'>('_rememberedState');
      const setIsFilledRecently = resolveSelfSetter<'isFilledRecently'>('isFilledRecently');
      const setDependentData: TSetDependentDataMethod = ((
        ...args: Parameters<TSetDependentDataMethod>
      ) => {
        if (
          typeof (self as unknown as { setDependentData?: TSetDependentDataMethod })
            .setDependentData === 'function'
        ) {
          (self as unknown as { setDependentData: TSetDependentDataMethod }).setDependentData(
            ...args,
          );
        }
      }) as TSetDependentDataMethod;
      const setCurrentState: TSetCurrentStateMethod = ((
        ...args: Parameters<TSetCurrentStateMethod>
      ) => {
        return (self as unknown as { setCurrentState: TSetCurrentStateMethod }).setCurrentState(
          ...args,
        );
      }) as TSetCurrentStateMethod;

      const rememberState = () => {
        const { currentState } = self as unknown as { currentState: TState };

        setRememberedState(currentState);
      };

      const resetToRememberState = () => {
        const { rememberedState } = self;

        if (rememberedState === undefined) {
          return;
        }

        setCurrentState(rememberedState);
        setIsFilledRecently(false);
      };

      const fill = (
        state: Parameters<TSetCurrentStateMethod>[0],
        dependentData?: Parameters<TSetDependentDataMethod>[0],
      ) => {
        if (dependentData !== undefined) {
          setDependentData(dependentData);
        }

        setCurrentState(state);

        setIsFilledRecently(true);
        rememberState();
      };

      return {
        fill,
        setRememberedState,
        rememberState,
        resetToRememberState,
      };
    });

  return typesMST.compose(fieldsModel, ModelRememberState) as typeof fieldsModel &
    typeof ModelRememberState;
};

export default withRememberState;
