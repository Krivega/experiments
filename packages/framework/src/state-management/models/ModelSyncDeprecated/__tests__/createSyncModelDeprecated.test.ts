/// <reference types="jest" />
import { destroy } from 'mobx-state-tree';

import ModelSyncDeprecated from '../ModelSyncDeprecated';

import type { TSyncStoreDeprecated } from '../ModelSyncDeprecated';

describe('ModelSyncDeprecated', () => {
  let syncStore: TSyncStoreDeprecated;

  beforeEach(() => {
    syncStore = ModelSyncDeprecated.create();
  });

  it('initial state', () => {
    expect(syncStore.isNotSynced).toBe(true);
    expect(syncStore.isSyncInProgress).toBe(false);
    expect(syncStore.isSynced).toBe(false);
  });

  it('isNotSynced and setNotSynced', () => {
    expect(syncStore.isNotSynced).toBe(true);

    syncStore.setSyncInProgress();

    expect(syncStore.isNotSynced).toBe(false);

    syncStore.setNotSynced();

    expect(syncStore.isNotSynced).toBe(true);
  });

  it('isSyncInProgress and setSyncInProgress', () => {
    expect(syncStore.isSyncInProgress).toBe(false);

    syncStore.setSyncInProgress();

    expect(syncStore.isSyncInProgress).toBe(true);
  });

  it('isSync and setSynced', () => {
    expect(syncStore.isSynced).toBe(false);

    syncStore.setSynced();

    expect(syncStore.isSynced).toBe(false);

    syncStore.setSyncInProgress();
    syncStore.setSynced();

    expect(syncStore.isSynced).toBe(true);
  });

  it('isSyncError and setSyncError', () => {
    expect(syncStore.isSyncError).toBe(false);

    syncStore.setSyncInProgress();
    syncStore.setSyncError();

    expect(syncStore.isSyncError).toBe(true);
  });

  it('isSyncRepeated from syncInProgress', () => {
    expect(syncStore.isSyncRepeated).toBe(false);

    syncStore.setSyncInProgress();
    syncStore.setSyncRepeated();

    expect(syncStore.isSyncRepeated).toBe(true);
  });

  it('synced from isSyncRepeated', () => {
    syncStore.setSyncInProgress();
    syncStore.setSyncRepeated();

    syncStore.setSynced();

    expect(syncStore.isSyncRepeated).toBe(false);
    expect(syncStore.isSynced).toBe(true);
  });

  it('syncError from isSyncRepeated', () => {
    syncStore.setSyncInProgress();
    syncStore.setSyncRepeated();

    syncStore.setSyncError();

    expect(syncStore.isSyncRepeated).toBe(false);
    expect(syncStore.isSyncError).toBe(true);
  });

  it('isReady and setSyncError and setSynced', () => {
    expect(syncStore.isReady).toBe(false);

    syncStore.setSyncInProgress();

    expect(syncStore.isReady).toBe(false);

    syncStore.setSyncError();

    expect(syncStore.isReady).toBe(true);

    syncStore.setSyncInProgress();

    expect(syncStore.isReady).toBe(false);

    syncStore.setSynced();

    expect(syncStore.isReady).toBe(true);
  });

  it('should call actor.stop beforeDestroy', () => {
    const stop = jest.spyOn(syncStore.actor, 'stop');

    destroy(syncStore);

    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('setSyncError with error message', () => {
    expect(syncStore.isSyncError).toBe(false);

    const mockError = { message: 'error' };

    syncStore.setSyncInProgress();
    syncStore.setSyncError(mockError);

    expect(syncStore.isSyncError).toBe(true);
    expect(syncStore.error).toEqual(mockError);
  });
});
