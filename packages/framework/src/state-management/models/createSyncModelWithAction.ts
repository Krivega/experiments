/**
 * Утилита для создания моделей с автоматической синхронизацией и управлением состоянием действий
 *
 * Создает модель, которая:
 * - Оборачивает переданную модель данных в поле `data`
 * - Добавляет поле `isActionInProgress` для отслеживания выполнения действий
 * - Предоставляет методы `startAction()` и `endAction()` для управления состоянием
 * - Проксирует метод `fill()` из вложенной модели с сохранением типизации
 * - Интегрируется с `ModelSync` для автоматической синхронизации состояний
 * - Управляет lifecycle через `StatusSync`
 *
 * @example
 * ```ts
 * // Базовое использование
 * const Model = createSyncModelWithAction(DataModel);
 *
 * // Модель автоматически получает базовые методы с правильными типами:
 * // - fill(data) - заполнение модели с типизированными параметрами
 * // - startAction() - начало действия
 * // - endAction() - окончание действия
 * ```
 */

import { types as typesMST } from 'mobx-state-tree';

import { createModelWithAction } from './ModelAction';
import { createSyncModel } from './ModelSync';

import type { TDataModel } from './ModelSync';

const createSyncModelWithAction = <TModel extends TDataModel>(dataModel: TModel) => {
  const ModelData = createSyncModel(dataModel);

  const ModelAction = createModelWithAction(typesMST.model());

  return typesMST.compose(ModelAction, ModelData);
};

export default createSyncModelWithAction;
