/**
 * Утилита для создания моделей с автоматической синхронизацией
 *
 * @example
 * ```ts
 * // Базовое использование
 * const Model = createAutoSyncModel(FieldsModel);
 *
 * // Модель автоматически получает базовые методы с правильными типами:
 * // - fill(data) - заполнение полей с типизированными параметрами
 * // - rememberState() - сохранение состояния
 * // - resetToRememberState() - сброс к сохраненному состоянию
 * ```
 */

import { types as typesMST } from 'mobx-state-tree';

import ModelSyncAuto from './ModelSyncAuto';
import StatusAutoSync from './StatusAutoSync';

import type { TInstanceModel } from '@experiments/mst-tools';
import type { IAnyModelType, Instance } from 'mobx-state-tree';
import type { TExtractMethodType, TExtractViewType } from '../types';

const createAutoSyncModel = <TFieldsModel extends IAnyModelType>(fieldsModel: TFieldsModel) => {
  // Получаем тип инстанса Fields модели
  type TFieldsInstance = Instance<TFieldsModel>;

  // Извлекаем точные типы вьюшек
  type TState = TExtractViewType<Instance<TFieldsModel>, 'currentState'>;
  type TRememberedState = TExtractViewType<Instance<TFieldsModel>, 'rememberedState'>;
  type TAffectedFields = Set<keyof TState>;
  // Извлекаем точные типы методов
  type TFillMethod = TExtractMethodType<TFieldsInstance, 'fill'>;
  type TRememberStateMethod = TExtractMethodType<TFieldsInstance, 'rememberState'>;
  type TResetToRememberStateMethod = TExtractMethodType<TFieldsInstance, 'resetToRememberState'>;
  type TSetRememberedStateMethod = TExtractMethodType<TFieldsInstance, 'setRememberedState'>;

  const modelWithFields = typesMST
    .model({
      fields: typesMST.optional(fieldsModel, {}),
    })
    .actions((self) => {
      const fields = self.fields as {
        rememberState: TRememberStateMethod;
        resetToRememberState: TResetToRememberStateMethod;
      };

      const rememberState: TRememberStateMethod = ((...args: Parameters<TRememberStateMethod>) => {
        return fields.rememberState(...args);
      }) as TRememberStateMethod;

      const resetToRememberState: TResetToRememberStateMethod = ((
        ...args: Parameters<TResetToRememberStateMethod>
      ) => {
        return fields.resetToRememberState(...args);
      }) as TResetToRememberStateMethod;

      return {
        rememberState,
        resetToRememberState,
      };
    });

  return typesMST
    .compose(modelWithFields, ModelSyncAuto)
    .views((self) => {
      const fields = self.fields as {
        affectedFields: TAffectedFields;
      };

      return {
        get isAvailableFilling() {
          return self.isSyncReady || self.isLoading;
        },

        /**
         * @deprecated unused
         */
        canChangeField(field: keyof TState) {
          const isAffected = fields.affectedFields.has(field);

          if (self.isNotReady) {
            return false;
          }

          return !(isAffected && self.isSaveInProgress);
        },
      };
    })
    .actions((self) => {
      const fields = self.fields as {
        fill: TFillMethod;
        setRememberedState: TSetRememberedStateMethod;
        rememberedState: TRememberedState;
      };

      const fill: TFillMethod = ((...args: Parameters<TFillMethod>) => {
        if (self.isAvailableFilling) {
          return fields.fill(...args);
        }

        const newState = args[0];
        let mergedState;

        if (typeof newState === 'object' && newState !== null) {
          const rememberedState = fields.rememberedState ?? {};

          mergedState = {
            ...rememberedState,
            ...newState,
          };
        } else {
          mergedState = newState;
        }

        return fields.setRememberedState(mergedState);
      }) as TFillMethod;

      return { fill };
    })
    .actions((self) => {
      const statusAutoSync = new StatusAutoSync(self as TInstanceModel<typeof self>);

      return {
        afterCreate: () => {
          statusAutoSync.subscribe();
        },
        beforeDestroy: () => {
          statusAutoSync.unsubscribe();
        },
      };
    });
};

export default createAutoSyncModel;
