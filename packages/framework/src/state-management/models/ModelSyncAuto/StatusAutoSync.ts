import { reaction } from 'mobx';

type TFields = {
  hasEqualState: () => boolean;
  currentState: unknown;
  isFilledAndRemembered: boolean;
};

type TInstanceBase = {
  fields: TFields;
  isNotSynced: boolean;
  isSyncInProgress: boolean;
  isSyncRetry: boolean;
  isSaveInProgress: boolean;
  isNotSaved: boolean;
  isSaveError: boolean;
  isSynced: boolean;
  setNotSaved: () => void;
  setSynced: () => void;
  setSaved: () => void;
  cancelChanges: () => void;
};

/**
 * Типы состояний формы, из которых возможен переход в Synced при равенстве состояний
 */
type TSyncableState = 'isNotSaved' | 'isSaveError' | 'isSaveInProgress';
type TStateHandler = () => void;

class StatusAutoSync<TInstance extends TInstanceBase> {
  private disposers: (() => void)[] = [];

  private readonly instance: TInstance;

  private readonly STATE_HANDLERS: Record<TSyncableState, TStateHandler> = {
    isNotSaved: () => {
      this.instance.cancelChanges();
    },
    isSaveError: () => {
      this.instance.cancelChanges();
    },
    isSaveInProgress: () => {
      this.instance.setSaved();
    },
  };

  public constructor(instance: TInstance) {
    this.instance = instance;
  }

  public subscribe(): void {
    this.unsubscribe();

    // Реакция на изменение текущего состояния
    this.disposers.push(
      reaction(
        () => {
          return [this.instance.fields.hasEqualState(), this.instance.fields.currentState] as const;
        },
        ([isEqual]) => {
          this.syncFormStatus(isEqual);
        },
      ),
    );

    // Реакция на заполнение формы
    this.disposers.push(
      reaction(
        () => {
          return this.instance.fields.isFilledAndRemembered;
        },
        (isFilledAndRemembered) => {
          this.syncFormFill(isFilledAndRemembered);
        },
        { fireImmediately: true },
      ),
    );
  }

  public unsubscribe(): void {
    this.disposers.forEach((disposer) => {
      disposer();
    });
    this.disposers = [];
  }

  /**
   * Находит текущее состояние формы из списка обрабатываемых состояний
   */
  private findCurrentState(): TSyncableState | undefined {
    return (Object.keys(this.STATE_HANDLERS) as TSyncableState[]).find((state) => {
      return this.instance[state];
    });
  }

  /**
   * Обрабатывает переход в состояние Synced при равенстве состояний
   */
  private handleEqualState(): void {
    const currentState = this.findCurrentState();

    if (currentState) {
      this.STATE_HANDLERS[currentState]();
    }
  }

  /**
   * Обрабатывает изменение состояния формы при неравенстве состояний
   */
  private handleUnequalState(): void {
    // Переводим форму в NotSaved при изменениях в состояниях Synced или SaveError
    if (this.instance.isSynced || this.instance.isSaveError) {
      this.instance.setNotSaved();
    }
  }

  /**
   * Синхронизирует статус формы в зависимости от изменения полей
   */
  private syncFormStatus(isEqual: boolean): void {
    if (isEqual) {
      this.handleEqualState();
    } else {
      this.handleUnequalState();
    }
  }

  /**
   * Синхронизирует статус формы после заполнения
   */
  private syncFormFill(isFilledAndRemembered: boolean): void {
    if (isFilledAndRemembered && (this.instance.isSyncInProgress || this.instance.isSyncRetry)) {
      this.instance.setSynced();
    }
  }
}

export default StatusAutoSync;
