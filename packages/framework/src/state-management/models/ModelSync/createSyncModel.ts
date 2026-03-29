/**
 * Утилита для создания моделей с автоматической синхронизацией
 *
 * @example
 * ```ts
 * // Базовое использование
 * const Model = createSyncModel(DataModel);
 *
 * // Модель автоматически получает базовые методы с правильными типами:
 * // - fill(data) - заполнение модели с типизированными параметрами
 * ```
 */

import { types as typesMST } from 'mobx-state-tree';

import ModelSync from './ModelSync';
import StatusSync from './StatusSync';

import type { TInstanceModel } from '@experiments/mst-tools';
import type { IModelType } from 'mobx-state-tree';
import type { TExtractMethodType } from '../types';

export type TDataModel = IModelType<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  {
    // Используем any для параметров и возвращаемого значения,
    // чтобы принять любую сигнатуру метода fill
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fill: (...args: any[]) => any;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;

const createSyncModel = <TModel extends TDataModel>(dataModel: TModel) => {
  // Получаем тип инстанса Data модели
  type TDataInstance = TInstanceModel<TModel>;

  // Извлекаем точный тип метода fill
  type TFillMethod = TExtractMethodType<TDataInstance, 'fill'>;

  const modelWithData = typesMST
    .model({
      data: typesMST.optional(dataModel, {}),
    })
    .actions((self) => {
      const data = self.data as {
        fill: TFillMethod;
      };

      const fill: TFillMethod = ((...args: Parameters<TFillMethod>) => {
        return data.fill(...args);
      }) as TFillMethod;

      return {
        fill,
      };
    });

  return typesMST.compose(modelWithData, ModelSync).actions((self) => {
    const statusSync = new StatusSync(self);

    return {
      afterCreate: () => {
        statusSync.subscribe();
      },
      beforeDestroy: () => {
        statusSync.unsubscribe();
      },
    };
  });
};

export default createSyncModel;
