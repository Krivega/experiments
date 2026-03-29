/// <reference types="jest" />
import { makeObservable, observable, reaction } from 'mobx';

import FormStatusSync from '../FormStatusSync';

describe('FormStatusSync', () => {
  const createMockInstance = () => {
    const returnValue = observable.box(false);

    const instance = {
      fields: {
        currentState: 0,
        isFilledAndRemembered: false,
        hasEqualState() {
          return returnValue.get();
        },
        hasValid() {
          return returnValue.get();
        },
      },
      isNotSynced: false,
      isSyncInProgress: false,
      isSaveInProgress: false,
      isNotValid: false,
      isNotSaved: false,
      isSaveError: false,
      isSynced: false,

      setNotSaved: jest.fn(() => {
        instance.isSynced = false;
        instance.isNotSaved = true;
      }),
      setNotValid: jest.fn(),
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
      isNotValid: observable,
      isNotSaved: observable,
      isSaveError: observable,
      isSynced: observable,
      fields: observable.shallow,
    });

    return instance;
  };

  let instance: ReturnType<typeof createMockInstance>;
  let formStatusSync: FormStatusSync<typeof instance>;

  beforeEach(() => {
    instance = createMockInstance();
    formStatusSync = new FormStatusSync(instance);
    jest.clearAllMocks();
  });

  afterEach(() => {
    formStatusSync.unsubscribe();
  });

  describe('Реакция на изменение текущего состояния', () => {
    it('вызывает cancelChanges, если hasEqualState === true и isNotSaved === true', () => {
      instance.setReturnValue(false);
      instance.isNotSaved = true;

      formStatusSync.subscribe();

      instance.setReturnValue(true);

      expect(instance.cancelChanges).toHaveBeenCalled();
    });

    it('вызывает cancelChanges, если hasEqualState === true и isNotValid === true', () => {
      instance.isNotValid = true;
      instance.setReturnValue(false);

      formStatusSync.subscribe();

      instance.setReturnValue(true);

      expect(instance.cancelChanges).toHaveBeenCalled();
    });

    it('вызывает cancelChanges, если hasEqualState === true и isSaveError === true', () => {
      instance.isSaveError = true;
      instance.setReturnValue(false);

      formStatusSync.subscribe();

      instance.setReturnValue(true);

      expect(instance.cancelChanges).toHaveBeenCalled();
    });

    it('вызывает setSaved, если hasEqualState === true и isSaveInProgress === true', () => {
      instance.isSaveInProgress = true;
      instance.setReturnValue(false);

      formStatusSync.subscribe();

      instance.setReturnValue(true);

      expect(instance.setSaved).toHaveBeenCalled();
    });

    it('вызывает setNotSaved, если hasEqualState === false и isSynced === true', () => {
      instance.isSynced = true;
      instance.setReturnValue(true);

      formStatusSync.subscribe();

      instance.setReturnValue(false);

      expect(instance.setNotSaved).toHaveBeenCalled();
    });

    it('реагирует на изменение currentState, если значения флагов соответствуют условиям', () => {
      instance.setReturnValue(true);
      instance.isSaveInProgress = true;

      formStatusSync.subscribe();

      instance.fields.currentState = 42;

      expect(instance.setSaved).toHaveBeenCalled();
    });
  });

  describe('Реакция на изменение валидности', () => {
    it('вызывает setNotValid, если hasValid === false и isNotSaved === true', () => {
      instance.isNotSaved = true;
      instance.setReturnValue(true);

      formStatusSync.subscribe();

      instance.setReturnValue(false);

      expect(instance.setNotValid).toHaveBeenCalled();
    });

    it('вызывает setNotSaved, если hasValid === true и isNotValid === true', () => {
      instance.isNotValid = true;
      instance.setReturnValue(false);

      formStatusSync.subscribe();

      instance.setReturnValue(true);

      expect(instance.setNotSaved).toHaveBeenCalled();
    });

    it('не вызывает setNotValid или setNotSaved, если hasValid === false и isNotValid === true', () => {
      instance.isNotValid = true;
      instance.setReturnValue(true);

      formStatusSync.subscribe();

      instance.setReturnValue(false);

      expect(instance.setNotValid).not.toHaveBeenCalled();
      expect(instance.setNotSaved).not.toHaveBeenCalled();
    });

    it('не реагирует на смену валидности, если форма не в режиме редактирования', () => {
      instance.isSynced = true;
      instance.setReturnValue(false);

      formStatusSync.subscribe();

      instance.setReturnValue(true);

      expect(instance.setNotValid).not.toHaveBeenCalled();
      expect(instance.setNotSaved).not.toHaveBeenCalled();
    });

    it('Устанавливает статус isNotValid когда форма синхронизирована, поля формы невалидны и значение поля изменено с невалидного на невалидное', () => {
      instance.setReturnValue(false);
      instance.isSynced = true;

      formStatusSync.subscribe();

      instance.fields.currentState = 42;

      expect(instance.setNotValid).toHaveBeenCalledTimes(1);
    });

    it('Устанавливает статус isNotSaved когда форма синхронизирована, поля формы невалидны и значение поля изменено с невалидного на валидное', () => {
      instance.isSynced = true;
      instance.setReturnValue(false);

      formStatusSync.subscribe();

      instance.fields.currentState = 42;
      instance.setReturnValue(true);

      expect(instance.setNotSaved).toHaveBeenCalledTimes(1);
    });
  });

  describe('Реакция на заполнение формы', () => {
    it('вызывает setSynced, если isFilledAndRemembered === true и isSyncInProgress === true', () => {
      instance.isSyncInProgress = true;
      instance.fields.isFilledAndRemembered = true;

      formStatusSync.subscribe();

      expect(instance.setSynced).toHaveBeenCalled();
    });

    it('не вызывает setSynced, если isFilledAndRemembered === false', () => {
      instance.isSyncInProgress = true;
      instance.fields.isFilledAndRemembered = false;

      formStatusSync.subscribe();

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

      formStatusSync.subscribe();
      formStatusSync.unsubscribe();

      expect(mockDisposer).toHaveBeenCalled();

      (reaction as unknown) = originalReaction;
    });

    it('очищает предыдущие подписки при повторном вызове subscribe', () => {
      const mockDisposer = jest.fn();
      const originalReaction = reaction;

      (reaction as jest.Mock) = jest.fn(() => {
        return mockDisposer;
      });

      formStatusSync.subscribe();
      formStatusSync.subscribe();

      expect(mockDisposer).toHaveBeenCalled();

      (reaction as unknown) = originalReaction;
    });
  });
});
