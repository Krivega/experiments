import { destroy } from 'mobx-state-tree';

import Model from '../Model';

import type { TInstance } from '../Model';

describe('Model', () => {
  let instance: TInstance;

  beforeEach(() => {
    instance = Model.create({ isModerator: false });
  });

  it('начальное состояние', () => {
    expect(instance.isNotSynced).toBe(true);
    expect(instance.isSyncInProgress).toBe(false);
    expect(instance.isBanned).toBe(false);
    expect(instance.isAvailable).toBe(false);
    expect(instance.isActive).toBe(false);
    expect(instance.isNotAvailable).toBe(false);
    expect(instance.isModerator).toBe(false);
    expect(instance.isActivated).toBe(false);
  });

  it('isSyncInProgress и setSyncInProgress', () => {
    instance.setSyncInProgress();

    expect(instance.isSyncInProgress).toBe(true);
    expect(instance.isNotSynced).toBe(false);
  });

  it('isNotSynced и setNotSynced', () => {
    instance.setSyncInProgress();
    instance.setNotSynced();

    expect(instance.isNotSynced).toBe(true);
  });

  it('isAvailable и setAvailable', () => {
    instance.setSyncInProgress();
    instance.setAvailable();

    expect(instance.isAvailable).toBe(true);
    expect(instance.isSyncInProgress).toBe(false);
    expect(instance.isActivated).toBe(false);
  });

  it('isNotAvailable и setNotAvailable', () => {
    instance.setSyncInProgress();
    instance.setNotAvailable();

    expect(instance.isNotAvailable).toBe(true);
    expect(instance.isSyncInProgress).toBe(false);
    expect(instance.isActivated).toBe(false);
  });

  it('isActive и setActive', () => {
    instance.setSyncInProgress();
    instance.setAvailable();
    instance.setActive();

    expect(instance.isActive).toBe(true);
    expect(instance.isAvailable).toBe(false);
    expect(instance.isActivated).toBe(true);
  });

  it('isBanned и setBanned', () => {
    instance.setSyncInProgress();
    instance.setAvailable();
    instance.setActive();
    instance.setBanned();

    expect(instance.isBanned).toBe(true);
    expect(instance.isActive).toBe(false);
    expect(instance.isActivated).toBe(true);
  });

  it('isModerator и setIsModerator', () => {
    expect(instance.isModerator).toBe(false);

    instance.setIsModerator(true);

    expect(instance.isModerator).toBe(true);

    instance.setIsModerator(false);

    expect(instance.isModerator).toBe(false);
  });

  it('должен вызвать actor.stop перед уничтожением', () => {
    const stop = jest.spyOn(instance.actor, 'stop');

    destroy(instance);

    expect(stop).toHaveBeenCalledTimes(1);
  });
});
