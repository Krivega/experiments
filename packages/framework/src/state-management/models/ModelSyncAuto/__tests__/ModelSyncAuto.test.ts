/// <reference types="jest" />
import { destroy } from 'mobx-state-tree';

import { ModelSyncAuto } from '../index';

import type { TInstanceSyncAuto } from '../index';

describe('ModelSyncAuto', () => {
  let instance: TInstanceSyncAuto;

  beforeEach(() => {
    instance = ModelSyncAuto.create();
  });

  it('initial state', () => {
    expect(instance.isNotSynced).toBe(true);
    expect(instance.isSyncInProgress).toBe(false);
    expect(instance.isSynced).toBe(false);
    expect(instance.isSyncError).toBe(false);
    expect(instance.isNotSaved).toBe(false);
    expect(instance.isSyncRetry).toBe(false);
    expect(instance.isSaveInProgress).toBe(false);
    expect(instance.isSaveError).toBe(false);
    expect(instance.isSaveAllowed).toBe(false);
    expect(instance.canSave()).toBe(false);
  });

  it('isSyncInProgress и setSyncInProgress', () => {
    expect(instance.isSyncInProgress).toBe(false);

    instance.setSyncInProgress();
    expect(instance.isSyncInProgress).toBe(true);
  });

  it('isSync и setSynced', () => {
    expect(instance.isSynced).toBe(false);

    instance.setSynced();
    expect(instance.isSynced).toBe(false);

    instance.setSyncInProgress();
    instance.setSynced();
    expect(instance.isSynced).toBe(true);
  });

  it('isSyncError и setSyncError', () => {
    expect(instance.isSyncError).toBe(false);

    instance.setSyncError();
    expect(instance.isSyncError).toBe(false);

    instance.setSyncInProgress();
    instance.setSyncError();
    expect(instance.isSyncError).toBe(true);
  });

  it('isSyncReady и setSynced', () => {
    expect(instance.isSyncReady).toBe(false);

    instance.setSyncInProgress();
    expect(instance.isSyncReady).toBe(false);

    instance.setSynced();
    expect(instance.isSyncReady).toBe(true);
  });

  it('isSyncReady и setSyncRetry', () => {
    expect(instance.isSyncReady).toBe(false);

    instance.setSyncInProgress();
    expect(instance.isSyncReady).toBe(false);

    instance.setSyncRetry();
    expect(instance.isSyncReady).toBe(false);

    instance.setSynced();
    expect(instance.isSyncReady).toBe(true);
  });

  describe('isNotReady', () => {
    it('должен быть true в начальном состоянии', () => {
      expect(instance.isNotReady).toBe(true);
    });

    it('должен быть true когда синхронизация в процессе', () => {
      instance.setSyncInProgress();
      expect(instance.isNotReady).toBe(true);
    });

    it('должен быть false когда синхронизация завершена', () => {
      instance.setSyncInProgress();
      instance.setSynced();
      expect(instance.isNotReady).toBe(false);
    });

    it('должен быть false когда синхронизация завершилась с ошибкой', () => {
      instance.setSyncInProgress();
      instance.setSyncError();
      expect(instance.isNotReady).toBe(false);
    });

    it('должен быть true когда синхронизация в режиме повторной попытки', () => {
      instance.setSyncInProgress();
      instance.setSyncRetry();
      expect(instance.isNotReady).toBe(true);
    });

    it('должен быть false после ошибки синхронизации', () => {
      instance.setSyncInProgress();
      instance.setSyncError();
      expect(instance.isNotReady).toBe(false);
    });
  });

  it('setSyncError с сообщением об ошибке', () => {
    expect(instance.isSyncError).toBe(false);

    const mockError = { message: 'error' };

    instance.setSyncInProgress();
    instance.setSyncError(mockError);

    expect(instance.isSyncError).toBe(true);
    expect(instance.error).toEqual(mockError);
  });

  it('isNotSaved и setNotSaved', () => {
    expect(instance.isNotSaved).toBe(false);

    instance.setNotSaved();
    expect(instance.isNotSaved).toBe(false);

    instance.setSyncInProgress();
    instance.setSynced();
    instance.setNotSaved();
    expect(instance.isNotSaved).toBe(true);
    expect(instance.isSaveAllowed).toBe(true);
    expect(instance.canSave()).toBe(true);
  });

  it('isSyncRetry и setSyncRetry', () => {
    expect(instance.isSyncRetry).toBe(false);

    instance.setSyncRetry();
    expect(instance.isSyncRetry).toBe(false);

    instance.setSyncInProgress();
    instance.setSyncRetry();
    expect(instance.isSyncRetry).toBe(true);
    expect(instance.isSaveAllowed).toBe(false);
    expect(instance.canSave()).toBe(false);
  });

  it('isSaveInProgress и setSaveInProgress', () => {
    expect(instance.isSaveInProgress).toBe(false);

    instance.setSaveInProgress();
    expect(instance.isSaveInProgress).toBe(false);

    instance.setSyncInProgress();
    instance.setSynced();
    instance.setNotSaved();
    instance.setSaveInProgress();
    expect(instance.isSaveInProgress).toBe(true);
  });

  it('ожидается переход в SYNCED после сохранения', () => {
    expect(instance.isSynced).toBe(false);

    instance.setSaved();
    expect(instance.isSynced).toBe(false);

    instance.setSyncInProgress();
    instance.setSynced();
    instance.setNotSaved();
    instance.setSaveInProgress();
    instance.setSaved();
    expect(instance.isSynced).toBe(true);
  });

  it('isSaveError и setSaveError', () => {
    expect(instance.isSaveError).toBe(false);

    instance.setSaveError();
    expect(instance.isSaveError).toBe(false);

    instance.setSyncInProgress();
    instance.setSynced();
    instance.setNotSaved();
    instance.setSaveInProgress();
    instance.setSaveError();
    expect(instance.isSaveError).toBe(true);
    expect(instance.isSaveAllowed).toBe(true);
    expect(instance.canSave()).toBe(true);
  });

  it('setSaveError с сообщением об ошибке', () => {
    expect(instance.isSaveError).toBe(false);

    const mockError = { message: 'error' };

    instance.setSyncInProgress();
    instance.setSynced();
    instance.setNotSaved();
    instance.setSaveInProgress();
    instance.setSaveError(mockError);

    expect(instance.isSaveError).toBe(true);
    expect(instance.error).toEqual(mockError);
  });

  it('cancelChanges возвращает в состояние SYNCED', () => {
    instance.setSyncInProgress();
    instance.setSynced();
    instance.setNotSaved();

    expect(instance.isNotSaved).toBe(true);

    instance.cancelChanges();
    expect(instance.isSynced).toBe(true);
    expect(instance.isNotSaved).toBe(false);
  });

  it('cancelChanges возвращает из состояния SAVE_ERROR', () => {
    instance.setSyncInProgress();
    instance.setSynced();
    instance.setNotSaved();
    instance.setSaveInProgress();
    instance.setSaveError();

    expect(instance.isSaveError).toBe(true);

    instance.cancelChanges();
    expect(instance.isSynced).toBe(true);
    expect(instance.isSaveError).toBe(false);
  });

  it('isSaveAllowed равно true в состояниях NOT_SAVED и SAVE_ERROR', () => {
    expect(instance.isSaveAllowed).toBe(false);
    expect(instance.canSave()).toBe(false);

    // Проверяем для NOT_SAVED
    instance.setSyncInProgress();
    instance.setSynced();
    instance.setNotSaved();
    expect(instance.isSaveAllowed).toBe(true);
    expect(instance.canSave()).toBe(true);

    // Проверяем для SAVE_ERROR
    instance.setSaveInProgress();
    instance.setSaveError();
    expect(instance.isSaveAllowed).toBe(true);
    expect(instance.canSave()).toBe(true);
  });

  it('ожидается вызов метода actor.stop в хуке beforeDestroy', () => {
    const stop = jest.spyOn(instance.actor, 'stop');

    destroy(instance);

    expect(stop).toHaveBeenCalledTimes(1);
  });

  describe('isLoading', () => {
    it('должен быть false в начальном состоянии', () => {
      expect(instance.isLoading).toBe(false);
    });

    it('должен быть true после setSyncInProgress', () => {
      instance.setSyncInProgress();

      expect(instance.isLoading).toBe(true);
    });

    it('должен быть true после setSyncRetry', () => {
      instance.setSyncInProgress();
      instance.setSyncRetry();

      expect(instance.isLoading).toBe(true);
    });

    it('должен быть false после выхода из SyncInProgress-состояний', () => {
      instance.setSyncInProgress();

      expect(instance.isLoading).toBe(true);

      instance.setSynced();

      expect(instance.isLoading).toBe(false);
    });

    it('должен быть false после выхода из SyncRetry-состояний', () => {
      instance.setSyncInProgress();
      instance.setSyncRetry();

      expect(instance.isLoading).toBe(true);

      instance.setSynced();

      expect(instance.isLoading).toBe(false);
    });
  });
});
