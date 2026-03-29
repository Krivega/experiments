/// <reference types="jest" />
import { makeObservable, observable, reaction } from 'mobx';

import StatusAutoSync from '../StatusAutoSync';

describe('StatusAutoSync', () => {
  const createMockInstance = () => {
    const returnValue = observable.box(false);

    const instance = {
      fields: {
        currentState: 0,
        isFilledAndRemembered: false,
        hasEqualState() {
          return returnValue.get();
        },
      },
      isNotSynced: false,
      isSyncInProgress: false,
      isSaveInProgress: false,
      isSyncRetry: false,
      isNotSaved: false,
      isSaveError: false,
      isSynced: false,

      setNotSaved: jest.fn(),
      setSyncRetry: jest.fn(),
      setSynced: jest.fn(),
      setSaved: jest.fn(),
      cancelChanges: jest.fn(),

      setReturnValue: (value: boolean) => {
        returnValue.set(value);
      },
    };

    makeObservable(instance, {
      isNotSynced: observable,
      isSyncInProgress: observable,
      isSaveInProgress: observable,
      isSyncRetry: observable,
      isNotSaved: observable,
      isSaveError: observable,
      isSynced: observable,
      fields: observable.shallow,
    });

    return instance;
  };

  let instance: ReturnType<typeof createMockInstance>;
  let statusAutoSync: StatusAutoSync<typeof instance>;

  beforeEach(() => {
    instance = createMockInstance();
    statusAutoSync = new StatusAutoSync(instance);
    jest.clearAllMocks();
  });

  afterEach(() => {
    statusAutoSync.unsubscribe();
  });

  describe('Реакция на изменение текущего состояния', () => {
    it('вызывает cancelChanges, если hasEqualState === true и isNotSaved === true', () => {
      instance.setReturnValue(false);
      instance.isNotSaved = true;

      statusAutoSync.subscribe();

      instance.setReturnValue(true);

      expect(instance.cancelChanges).toHaveBeenCalled();
    });

    it('вызывает cancelChanges, если hasEqualState === true и isSaveError === true', () => {
      instance.isSaveError = true;
      instance.setReturnValue(false);

      statusAutoSync.subscribe();

      instance.setReturnValue(true);

      expect(instance.cancelChanges).toHaveBeenCalled();
    });

    it('вызывает setSaved, если hasEqualState === true и isSaveInProgress === true', () => {
      instance.isSaveInProgress = true;
      instance.setReturnValue(false);

      statusAutoSync.subscribe();

      instance.setReturnValue(true);

      expect(instance.setSaved).toHaveBeenCalled();
    });

    it('вызывает setNotSaved, если hasEqualState === false и isSynced === true', () => {
      instance.isSynced = true;
      instance.setReturnValue(true);

      statusAutoSync.subscribe();

      instance.setReturnValue(false);

      expect(instance.setNotSaved).toHaveBeenCalled();
    });

    it('вызывает setNotSaved, если hasEqualState === false и isSaveError === true', () => {
      instance.isSaveError = true;
      instance.setReturnValue(true);

      statusAutoSync.subscribe();

      instance.setReturnValue(false);

      expect(instance.setNotSaved).toHaveBeenCalled();
    });

    it('не вызывает setNotSaved, если hasEqualState === false но ни isSynced ни isSaveError не установлены', () => {
      // Убеждаемся, что ни isSynced, ни isSaveError не установлены
      instance.isSynced = false;
      instance.isSaveError = false;
      instance.setReturnValue(true);

      statusAutoSync.subscribe();

      instance.setReturnValue(false);

      expect(instance.setNotSaved).not.toHaveBeenCalled();
    });

    it('реагирует на изменение currentState, если значения флагов соответствуют условиям', () => {
      instance.setReturnValue(true);
      instance.isSaveInProgress = true;

      statusAutoSync.subscribe();

      instance.fields.currentState = 42;

      expect(instance.setSaved).toHaveBeenCalled();
    });

    it('не вызывает никаких действий, если hasEqualState === true но ни одно состояние не активно', () => {
      // Убеждаемся, что ни одно из состояний не активно
      instance.isNotSaved = false;
      instance.isSaveError = false;
      instance.isSaveInProgress = false;
      instance.setReturnValue(false);

      statusAutoSync.subscribe();

      instance.setReturnValue(true);

      // Никакие методы не должны вызываться
      expect(instance.cancelChanges).not.toHaveBeenCalled();
      expect(instance.setSaved).not.toHaveBeenCalled();
      expect(instance.setSynced).not.toHaveBeenCalled();
    });
  });

  describe('Реакция на заполнение формы', () => {
    it('вызывает setSynced, если isFilledAndRemembered === true и isSyncInProgress === true', () => {
      instance.isSyncInProgress = true;
      instance.isSyncRetry = false;
      instance.fields.isFilledAndRemembered = true;

      statusAutoSync.subscribe();

      expect(instance.setSynced).toHaveBeenCalled();
    });

    it('вызывает setSynced, если isFilledAndRemembered === true и isSyncRetry === true', () => {
      instance.isSyncInProgress = false;
      instance.isSyncRetry = true;
      instance.fields.isFilledAndRemembered = true;

      statusAutoSync.subscribe();

      expect(instance.setSynced).toHaveBeenCalled();
    });

    it('не вызывает setSynced, если isFilledAndRemembered === false', () => {
      instance.isSyncInProgress = true;
      instance.isSyncRetry = false;
      instance.fields.isFilledAndRemembered = false;

      statusAutoSync.subscribe();

      expect(instance.setSynced).not.toHaveBeenCalled();
    });

    it('не вызывает setSynced, если isFilledAndRemembered === true, но ни isSyncInProgress, ни isSyncRetry не установлены', () => {
      instance.isSyncInProgress = false;
      instance.isSyncRetry = false;
      instance.fields.isFilledAndRemembered = true;

      statusAutoSync.subscribe();

      expect(instance.setSynced).not.toHaveBeenCalled();
    });
  });

  describe('Управление реакциями', () => {
    it('отписывается от всех реакций при вызове unsubscribe', () => {
      const mockDisposer = jest.fn();
      const originalReaction = reaction;

      (reaction as jest.Mock) = jest.fn(() => {
        return mockDisposer;
      });

      statusAutoSync.subscribe();
      statusAutoSync.unsubscribe();

      expect(mockDisposer).toHaveBeenCalled();

      (reaction as unknown) = originalReaction;
    });

    it('очищает предыдущие подписки при повторном вызове subscribe', () => {
      const mockDisposer = jest.fn();
      const originalReaction = reaction;

      (reaction as jest.Mock) = jest.fn(() => {
        return mockDisposer;
      });

      statusAutoSync.subscribe();
      statusAutoSync.subscribe();

      expect(mockDisposer).toHaveBeenCalled();

      (reaction as unknown) = originalReaction;
    });
  });
});
