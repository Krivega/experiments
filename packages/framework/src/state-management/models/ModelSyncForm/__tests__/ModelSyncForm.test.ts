/// <reference types="jest" />
import { destroy } from 'mobx-state-tree';

import { ModelSyncForm, type TSyncFormStore } from '../index';

describe('ModelSyncForm', () => {
  let instance: TSyncFormStore;

  beforeEach(() => {
    instance = ModelSyncForm.create();
  });

  it('initial state', () => {
    expect(instance.isNotSynced).toBe(true);
    expect(instance.isSyncInProgress).toBe(false);
    expect(instance.isSynced).toBe(false);
    expect(instance.isSyncError).toBe(false);
    expect(instance.isNotSaved).toBe(false);
    expect(instance.isNotValid).toBe(false);
    expect(instance.isSaveInProgress).toBe(false);
    expect(instance.isSaveError).toBe(false);
    expect(instance.isSaveAllowed).toBe(false);
    expect(instance.isCancelAllowed).toBe(false);
    expect(instance.canSave()).toBe(false);
    expect(instance.canReset()).toBe(false);
  });

  it('isSyncInProgress and setSyncInProgress', () => {
    expect(instance.isSyncInProgress).toBe(false);

    instance.setSyncInProgress();
    expect(instance.isSyncInProgress).toBe(true);
  });

  it('isSync and setSynced', () => {
    expect(instance.isSynced).toBe(false);

    instance.setSynced();
    expect(instance.isSynced).toBe(false);

    instance.setSyncInProgress();
    instance.setSynced();
    expect(instance.isSynced).toBe(true);
  });

  it('isSyncError and setSyncError', () => {
    expect(instance.isSyncError).toBe(false);

    instance.setSyncError();
    expect(instance.isSyncError).toBe(false);

    instance.setSyncInProgress();
    instance.setSyncError();
    expect(instance.isSyncError).toBe(true);
  });

  it('isSyncReady and setSynced', () => {
    expect(instance.isSyncReady).toBe(false);

    instance.setSyncInProgress();
    expect(instance.isSyncReady).toBe(false);

    instance.setSynced();
    expect(instance.isSyncReady).toBe(true);
  });

  it('isSyncReady and setSyncError', () => {
    expect(instance.isSyncReady).toBe(false);

    instance.setSyncInProgress();
    expect(instance.isSyncReady).toBe(false);

    instance.setSyncError();
    expect(instance.isSyncReady).toBe(true);
  });

  describe('isNotReady', () => {
    it('should be true for initial state', () => {
      expect(instance.isNotReady).toBe(true);
    });

    it('should be true when sync is in progress', () => {
      instance.setSyncInProgress();
      expect(instance.isNotReady).toBe(true);
    });

    it('should be false when sync is completed', () => {
      instance.setSyncInProgress();
      instance.setSynced();
      expect(instance.isNotReady).toBe(false);
    });

    it('should be false when sync has error', () => {
      instance.setSyncInProgress();
      instance.setSyncError();
      expect(instance.isNotReady).toBe(false);
    });
  });

  it('isNotSaved and setNotSaved', () => {
    expect(instance.isNotSaved).toBe(false);

    instance.setNotSaved();
    expect(instance.isNotSaved).toBe(false);

    instance.setSyncInProgress();
    instance.setSynced();
    instance.setNotSaved();
    expect(instance.isNotSaved).toBe(true);
    expect(instance.isSaveAllowed).toBe(true);
    expect(instance.isCancelAllowed).toBe(true);
    expect(instance.canSave()).toBe(true);
    expect(instance.canReset()).toBe(true);
  });

  it('isNotValid and setNotValid', () => {
    expect(instance.isNotValid).toBe(false);

    instance.setNotValid();
    expect(instance.isNotValid).toBe(false);

    instance.setSyncInProgress();
    instance.setSynced();
    instance.setNotSaved();
    instance.setNotValid();
    expect(instance.isNotValid).toBe(true);
    expect(instance.isSaveAllowed).toBe(false);
    expect(instance.isCancelAllowed).toBe(true);
    expect(instance.canSave()).toBe(false);
    expect(instance.canReset()).toBe(true);
  });

  it('isSaveInProgress and setSaveInProgress', () => {
    expect(instance.isSaveInProgress).toBe(false);

    instance.setSaveInProgress();
    expect(instance.isSaveInProgress).toBe(false);

    instance.setSyncInProgress();
    instance.setSynced();
    instance.setNotSaved();
    instance.setSaveInProgress();
    expect(instance.isSaveInProgress).toBe(true);
    expect(instance.canSave()).toBe(false);
    expect(instance.canReset()).toBe(false);
  });

  it('should transition to SYNCED after successful save', () => {
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

  it('isSaveError and setSaveError', () => {
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
    expect(instance.isCancelAllowed).toBe(true);
    expect(instance.canSave()).toBe(true);
    expect(instance.canReset()).toBe(true);
  });

  it('setSaveError with error message', () => {
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

  it('cancelChanges should revert to SYNCED state', () => {
    instance.setSyncInProgress();
    instance.setSynced();
    instance.setNotSaved();

    expect(instance.isNotSaved).toBe(true);

    instance.cancelChanges();
    expect(instance.isSynced).toBe(true);
    expect(instance.isNotSaved).toBe(false);
  });

  it('cancelChanges should revert from NOT_VALID state', () => {
    instance.setSyncInProgress();
    instance.setSynced();
    instance.setNotSaved();
    instance.setNotValid();

    expect(instance.isNotValid).toBe(true);

    instance.cancelChanges();
    expect(instance.isSynced).toBe(true);
    expect(instance.isNotValid).toBe(false);
  });

  it('cancelChanges should revert from SAVE_ERROR state', () => {
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

  it('isSaveAllowed should be true for NOT_SAVED and SAVE_ERROR states', () => {
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

  it('isCancelAllowed should be true for NOT_SAVED, SAVE_ERROR and NOT_VALID states', () => {
    expect(instance.isCancelAllowed).toBe(false);
    expect(instance.canReset()).toBe(false);

    instance.setSyncInProgress();
    instance.setSynced();
    instance.setNotSaved();
    expect(instance.isCancelAllowed).toBe(true);
    expect(instance.canReset()).toBe(true);

    instance.setNotValid();
    expect(instance.isCancelAllowed).toBe(true);
    expect(instance.canReset()).toBe(true);

    instance.setSaveInProgress();
    instance.setSaveError();
    expect(instance.isCancelAllowed).toBe(true);
    expect(instance.canReset()).toBe(true);
  });

  it('should call actor.stop beforeDestroy', () => {
    const stop = jest.spyOn(instance.actor, 'stop');

    destroy(instance);

    expect(stop).toHaveBeenCalledTimes(1);
  });
});
