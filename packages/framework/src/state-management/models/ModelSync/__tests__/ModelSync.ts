/// <reference types="jest" />
import { destroy } from 'mobx-state-tree';

import ModelSync from '../ModelSync';

import type { TInstanceSync } from '../ModelSync';

describe('ModelSync', () => {
  let instance: TInstanceSync;

  beforeEach(() => {
    instance = ModelSync.create();
  });

  it('начальное состояние', () => {
    expect(instance.isNotSynced).toBe(true);
    expect(instance.isSyncInProgress).toBe(false);
    expect(instance.isSynced).toBe(false);
    expect(instance.isSyncRetry).toBe(false);
    expect(instance.isReady).toBe(false);
    expect(instance.error).toBe(undefined);
  });

  it('isSyncInProgress и setSyncInProgress', () => {
    expect(instance.isSyncInProgress).toBe(false);

    instance.setSyncInProgress();

    expect(instance.isSyncInProgress).toBe(true);
  });

  it('isSynced и setSynced', () => {
    expect(instance.isSynced).toBe(false);

    instance.setSynced();

    expect(instance.isSynced).toBe(false);

    instance.setSyncInProgress();
    instance.setSynced();

    expect(instance.isSynced).toBe(true);
  });

  it('isSyncError и setSyncError', () => {
    expect(instance.isSyncError).toBe(false);

    instance.setSyncInProgress();
    instance.setSyncError();

    expect(instance.isSyncError).toBe(true);
  });

  it('isSyncRetry и setSyncRetry', () => {
    expect(instance.isSyncRetry).toBe(false);

    instance.setSyncInProgress();
    instance.setSyncRetry();

    expect(instance.isSyncRetry).toBe(true);
  });

  it('isReady и setSyncError и setSynced', () => {
    expect(instance.isReady).toBe(false);

    instance.setSyncInProgress();

    expect(instance.isReady).toBe(false);

    instance.setSyncError();

    expect(instance.isReady).toBe(true);

    instance.setSynced();

    expect(instance.isReady).toBe(true);
  });

  it('должен вызвать actor.stop перед уничтожением', () => {
    const stop = jest.spyOn(instance.actor, 'stop');

    destroy(instance);

    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('setSyncError и error', () => {
    expect(instance.isSyncError).toBe(false);

    const mockError = { message: 'error' };

    instance.setSyncInProgress();
    instance.setSyncError(mockError);

    expect(instance.isSyncError).toBe(true);
    expect(instance.error).toEqual(mockError);
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
