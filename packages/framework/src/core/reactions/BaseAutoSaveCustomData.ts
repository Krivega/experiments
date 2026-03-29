import { debounce } from 'lodash';
import { reaction } from 'mobx';

import { BaseReaction } from './BaseReaction';

import type { TBaseExecutableActions } from './types';

export type TFieldsStates<TState> = {
  currentState: TState;
  changedState: Partial<TState>;
};

export interface ISaveFormInstance<TState = unknown> {
  setSaveInProgress: () => void;
  setSaveError: () => void;
  rememberState: () => void;
  resetToRememberState: () => void;
  canSave: () => boolean;
  isNotSaved: boolean;
  fields: TFieldsStates<TState>;
}

export interface ICoreApiSave {
  hideAllNotifications: () => void;
  showSuccessNotifications?: () => void;
  showFailedNotifications: (error?: unknown) => void;
}

export interface IServerApiSave<TSaveData = unknown> {
  hasAbortedError: (error: unknown) => boolean;
  setData: (data: TSaveData) => { promise: Promise<void>; abort: () => void };
}

type TBaseDependencies<TData> = { serverApi: IServerApiSave<TData>; coreApi: ICoreApiSave };

const DEFAULT_DELAY = 150;

/**
 * Абстрактный класс автосохранения формы.
 * Предоставляет общую логику отслеживания изменений, вызова API и обработки состояний.
 * Требует реализации метода `getSaveData()`, который должен возвращать данные для сохранения.
 */
export abstract class BaseAutoSaveCustomData<
  TState,
  TSaveData,
  TInstance extends ISaveFormInstance<TState> = ISaveFormInstance<TState>,
  TDependencies extends TBaseDependencies<TSaveData> = TBaseDependencies<TSaveData>,
  TExecutableActions extends TBaseExecutableActions = TBaseExecutableActions,
> extends BaseReaction<TInstance, TDependencies, TExecutableActions> {
  protected abortResponse: (() => void) | undefined;

  protected delay: number;

  public constructor(
    {
      instance,
      dependencies,
      executableActions,
    }: {
      instance: TInstance;
      dependencies: TDependencies;
      executableActions: TExecutableActions;
    },
    {
      delay = DEFAULT_DELAY,
    }: {
      delay?: number;
    } = {},
  ) {
    super({ instance, dependencies, executableActions });

    this.delay = delay;
  }

  public run() {
    const saveAction = debounce(this.save, this.delay);

    const disposer = reaction(this.getChangedState, saveAction);

    return () => {
      this.debug('unsubscribe form save reaction');

      disposer();

      this.abortResponse?.();
    };
  }

  public save = () => {
    if (!this.instance.canSave()) {
      return;
    }

    if (this.abortResponse) {
      this.abortResponse();
    }

    this.handleStart();

    Promise.resolve()
      .then(() => {
        return this.getSaveData();
      })
      .then(async (data) => {
        const { promise, abort } = this.callServerApi(data);

        this.abortResponse = abort;

        return promise;
      })
      .then(() => {
        this.handleSuccess();
      })
      .catch((error: unknown) => {
        this.handleError(error);
      })
      .finally(() => {
        delete this.abortResponse;
      });
  };

  protected handleStart(): void {
    this.dependencies.coreApi.hideAllNotifications();
    this.instance.setSaveInProgress();
  }

  protected handleSuccess(): void {
    this.dependencies.coreApi.showSuccessNotifications?.();

    if (this.instance.isNotSaved) {
      return;
    }

    this.instance.rememberState();
  }

  protected handleError(error: unknown): void {
    this.debug('error', error);

    this.instance.setSaveError();

    if (!this.dependencies.serverApi.hasAbortedError(error)) {
      this.dependencies.coreApi.showFailedNotifications(error);
      this.instance.resetToRememberState();
    }
  }

  protected callServerApi(data: TSaveData) {
    return this.dependencies.serverApi.setData(data);
  }

  protected getChangedState = () => {
    // why not 'return instance.canSave();' ?!
    // 1 = true [2 3 4 5 (0.1 = !!needSave) ... {0.1 x N} ...18] 19 = false 20 = true
    return this.instance.fields.changedState;
  };

  protected abstract getSaveData(): TSaveData;
}
