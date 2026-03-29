import { BaseAutoSaveCustomData } from './BaseAutoSaveCustomData';

import type {
  ICoreApiSave,
  ISaveFormInstance,
  IServerApiSave,
  TFieldsStates,
} from './BaseAutoSaveCustomData';
import type { TBaseExecutableActions } from './types';

type TBaseDependencies<TData> = { serverApi: IServerApiSave<TData>; coreApi: ICoreApiSave };

/**
 * Базовая реализация автосохранения формы.
 * Использует `instance.fields.currentState` и `instance.fields.changedState`
 * в качестве данных для сохранения.
 * Подходит для большинства стандартных кейсов.
 */
export abstract class BaseAutoSave<
  TState,
  TInstance extends ISaveFormInstance<TState> = ISaveFormInstance<TState>,
  TDependencies extends TBaseDependencies<TFieldsStates<TState>> = TBaseDependencies<
    TFieldsStates<TState>
  >,
  TExecutableActions extends TBaseExecutableActions = TBaseExecutableActions,
> extends BaseAutoSaveCustomData<
  TState,
  TFieldsStates<TState>,
  TInstance,
  TDependencies,
  TExecutableActions
> {
  protected getSaveData(): TFieldsStates<TState> {
    return {
      changedState: this.getChangedState(),
      currentState: this.instance.fields.currentState,
    };
  }
}
