/// <reference types="jest" />
import { createActor } from 'xstate';

import { constants, syncFormMachine } from '..';

const {
  EVENT_CHANGE,
  EVENT_SAVE,
  EVENT_SAVE_ERROR,
  EVENT_SYNC_SUCCESS,
  EVENT_SYNC_ERROR,
  EVENT_INIT,
  NOT_SAVED,
  SAVE_ERROR,
  SAVE_IN_PROGRESS,
  SYNCED,
  SYNC_ERROR,
  SYNC_IN_PROGRESS,
} = constants;

describe('syncActor: transitions from SYNCED', () => {
  let syncActor: ReturnType<typeof createActor<typeof syncFormMachine>>;

  beforeEach(() => {
    syncActor = createActor(syncFormMachine);
    syncActor.start();
    syncActor.send({ type: EVENT_INIT });
    syncActor.send({ type: EVENT_SYNC_SUCCESS });
  });

  it('should initially be SYNCED', () => {
    expect(syncActor.getSnapshot().value).toBe(SYNCED);
  });

  it('should not transition to SYNC_IN_PROGRESS', () => {
    syncActor.send({ type: EVENT_INIT });

    expect(syncActor.getSnapshot().matches(SYNCED)).toBe(true);
    expect(syncActor.getSnapshot().matches(SYNC_IN_PROGRESS)).toBe(false);
  });

  it('should not transition to SYNC_ERROR', () => {
    syncActor.send({ type: EVENT_SYNC_ERROR });

    expect(syncActor.getSnapshot().matches(SYNCED)).toBe(true);
    expect(syncActor.getSnapshot().matches(SYNC_ERROR)).toBe(false);
  });

  it('should not transition to SAVE_ERROR', () => {
    syncActor.send({ type: EVENT_SAVE_ERROR });

    expect(syncActor.getSnapshot().matches(SYNCED)).toBe(true);
    expect(syncActor.getSnapshot().matches(SAVE_ERROR)).toBe(false);
  });

  it('should not transition to SAVE_IN_PROGRESS', () => {
    syncActor.send({ type: EVENT_SAVE });

    expect(syncActor.getSnapshot().matches(SYNCED)).toBe(true);
    expect(syncActor.getSnapshot().matches(SAVE_IN_PROGRESS)).toBe(false);
  });

  it('should transition to NOT_SAVED', () => {
    syncActor.send({ type: EVENT_CHANGE });

    expect(syncActor.getSnapshot().value).toBe(NOT_SAVED);
  });
});
