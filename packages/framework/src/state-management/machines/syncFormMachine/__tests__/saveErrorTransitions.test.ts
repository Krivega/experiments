/// <reference types="jest" />
import { createActor } from 'xstate';

import { constants, syncFormMachine } from '..';

const {
  EVENT_CHANGE,
  EVENT_SAVE,
  EVENT_SAVE_ERROR,
  EVENT_SAVE_SUCCESS,
  EVENT_SYNC_SUCCESS,
  EVENT_SYNC_ERROR,
  EVENT_INIT,
  EVENT_CANCEL,
  NOT_SAVED,
  SAVE_ERROR,
  SAVE_IN_PROGRESS,
  SYNCED,
  SYNC_ERROR,
  SYNC_IN_PROGRESS,
} = constants;

describe('syncActor: transitions from SAVE_ERROR', () => {
  let syncActor: ReturnType<typeof createActor<typeof syncFormMachine>>;

  beforeEach(() => {
    syncActor = createActor(syncFormMachine);
    syncActor.start();
    syncActor.send({ type: EVENT_INIT });
    syncActor.send({ type: EVENT_SYNC_SUCCESS });
    syncActor.send({ type: EVENT_CHANGE });
    syncActor.send({ type: EVENT_SAVE });
    syncActor.send({ type: EVENT_SAVE_ERROR });
  });

  it('should initially be SAVE_ERROR', () => {
    expect(syncActor.getSnapshot().value).toBe(SAVE_ERROR);
  });

  it('should not transition to SYNC_IN_PROGRESS', () => {
    syncActor.send({ type: EVENT_INIT });

    expect(syncActor.getSnapshot().matches(SAVE_ERROR)).toBe(true);
    expect(syncActor.getSnapshot().matches(SYNC_IN_PROGRESS)).toBe(false);
  });

  it('should not transition to SYNC_ERROR', () => {
    syncActor.send({ type: EVENT_SYNC_ERROR });

    expect(syncActor.getSnapshot().matches(SAVE_ERROR)).toBe(true);
    expect(syncActor.getSnapshot().matches(SYNC_ERROR)).toBe(false);
  });

  it('should not transition to SYNCED before SAVE_IN_PROGRESS', () => {
    syncActor.send({ type: EVENT_SAVE_SUCCESS });

    expect(syncActor.getSnapshot().matches(SAVE_ERROR)).toBe(true);
    expect(syncActor.getSnapshot().matches(SYNCED)).toBe(false);
  });

  it('should transition to SAVE_IN_PROGRESS', () => {
    syncActor.send({ type: EVENT_SAVE });

    expect(syncActor.getSnapshot().value).toBe(SAVE_IN_PROGRESS);
  });

  it('should transition to NOT_SAVED', () => {
    syncActor.send({ type: EVENT_CHANGE });

    expect(syncActor.getSnapshot().value).toBe(NOT_SAVED);
  });

  it('should transition to SYNCED', () => {
    syncActor.send({ type: EVENT_CANCEL });

    expect(syncActor.getSnapshot().value).toBe(SYNCED);
  });
});
