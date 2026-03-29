/**
 * Утилита для создания моделей форм с автоматической синхронизацией
 *
 * @example
 * ```ts
 * // Базовое использование
 * const Model = createFormSyncModel(FieldsModel);
 *
 * // Модель автоматически получает базовые методы с правильными типами:
 * // - fill(data: ConcreteType) - типизированное заполнение полей
 * // - rememberState() - сохранение состояния
 * // - resetToRememberState() - сброс к сохраненному состоянию
 * // + методы для управления состоянием формы (валидация, сохранение, etc.)
 * ```
 */

import { types as typesMST } from 'mobx-state-tree';

import FormStatusSync from './FormStatusSync';
import ModelSyncForm from './ModelSyncForm';

import type { TInstanceModel } from '@experiments/mst-tools';
import type { IAnyModelType, Instance } from 'mobx-state-tree';
import type { TExtractMethodType } from '../types';

const createFormSyncModel = <TFieldsModel extends IAnyModelType>(fieldsModel: TFieldsModel) => {
  // Получаем тип инстанса Fields модели
  type TFieldsInstance = Instance<TFieldsModel>;

  // Извлекаем точные типы методов
  type TFillMethod = TExtractMethodType<TFieldsInstance, 'fill'>;
  type TRememberFieldsMethod = TExtractMethodType<TFieldsInstance, 'rememberState'>;
  type TResetToRememberFieldsMethod = TExtractMethodType<TFieldsInstance, 'resetToRememberState'>;

  const modelWithFields = typesMST
    .model({
      fields: typesMST.optional(fieldsModel, {}),
    })
    .views((self) => {
      return {
        // Получение текущего состояния полей
        getCurrentFields() {
          const fields = self.fields as TFieldsInstance;

          return (fields as { currentState?: unknown }).currentState;
        },
      };
    })
    .actions((self) => {
      const fields = self.fields as {
        fill: TFillMethod;
        rememberState: TRememberFieldsMethod;
        resetToRememberState: TResetToRememberFieldsMethod;
      };

      // Базовые методы работы с полями
      const fill: TFillMethod = ((...args: Parameters<TFillMethod>) => {
        return fields.fill(...args);
      }) as TFillMethod;

      const rememberState: TRememberFieldsMethod = ((
        ...args: Parameters<TRememberFieldsMethod>
      ) => {
        return fields.rememberState(...args);
      }) as TRememberFieldsMethod;

      const resetToRememberState: TResetToRememberFieldsMethod = ((
        ...args: Parameters<TResetToRememberFieldsMethod>
      ) => {
        return fields.resetToRememberState(...args);
      }) as TResetToRememberFieldsMethod;

      return {
        fill,
        rememberState,
        resetToRememberState,
      };
    });

  return typesMST.compose(modelWithFields, ModelSyncForm).actions((self) => {
    const formStatusSync = new FormStatusSync(self as TInstanceModel<typeof self>);

    return {
      afterCreate: () => {
        formStatusSync.subscribe();
      },
      beforeDestroy: () => {
        formStatusSync.unsubscribe();
      },
    };
  });
};

export default createFormSyncModel;
