/**
 * Утилита для создания моделей с автоматической синхронизацией и управлением состоянием действий
 *
 * Создает модель, которая:
 * - Оборачивает переданную модель данных в поле `data`
 * - Добавляет поле `isActionInProgress` для отслеживания выполнения действий
 * - Предоставляет методы `startAction()` и `endAction()` для управления состоянием
 *
 * @example
 * ```ts
 * // Базовое использование
 * const Model = createModelWithAction(FieldsModel);
 *
 * // Модель автоматически получает базовые методы с правильными типами:
 * // - startAction() - начало действия
 * // - endAction() - окончание действия
 * ```
 */

import { types as typesMST } from 'mobx-state-tree';

import ModelAction from './ModelAction';

import type { IAnyModelType } from 'mobx-state-tree';

const createModelWithAction = <TModel extends IAnyModelType>(dataModel: TModel) => {
  const modelWithData = typesMST.model({
    data: typesMST.optional(dataModel, {}),
  });

  return typesMST.compose(modelWithData, ModelAction);
};

export default createModelWithAction;
