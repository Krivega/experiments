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
  NOT_SAVED,
  SAVE_ERROR,
  SAVE_IN_PROGRESS,
  SYNCED,
  SYNC_ERROR,
  SYNC_IN_PROGRESS,
} = constants;

describe('syncActor: transitions from SAVE_IN_PROGRESS', () => {
  let syncActor: ReturnType<typeof createActor<typeof syncFormMachine>>;

  beforeEach(() => {
    syncActor = createActor(syncFormMachine);
    syncActor.start();
    syncActor.send({ type: EVENT_INIT });
    syncActor.send({ type: EVENT_SYNC_SUCCESS });
    syncActor.send({ type: EVENT_CHANGE });
    syncActor.send({ type: EVENT_SAVE });
  });

  it('should initially be SAVE_IN_PROGRESS', () => {
    expect(syncActor.getSnapshot().value).toBe(SAVE_IN_PROGRESS);
  });

  it('should not transition to SYNC_IN_PROGRESS', () => {
    syncActor.send({ type: EVENT_INIT });

    expect(syncActor.getSnapshot().matches(SAVE_IN_PROGRESS)).toBe(true);
    expect(syncActor.getSnapshot().matches(SYNC_IN_PROGRESS)).toBe(false);
  });

  it('should not transition to SYNCED before EVENT_SAVE_SUCCESS', () => {
    syncActor.send({ type: EVENT_SYNC_SUCCESS });

    expect(syncActor.getSnapshot().matches(SAVE_IN_PROGRESS)).toBe(true);
    expect(syncActor.getSnapshot().matches(SYNCED)).toBe(false);
  });

  it('should not transition to SYNC_ERROR', () => {
    syncActor.send({ type: EVENT_SYNC_ERROR });

    expect(syncActor.getSnapshot().matches(SAVE_IN_PROGRESS)).toBe(true);
    expect(syncActor.getSnapshot().matches(SYNC_ERROR)).toBe(false);
  });

  it('should not transition to NOT_SAVED', () => {
    syncActor.send({ type: EVENT_CHANGE });

    expect(syncActor.getSnapshot().matches(SAVE_IN_PROGRESS)).toBe(true);
    expect(syncActor.getSnapshot().matches(NOT_SAVED)).toBe(false);
  });

  it('should transition from SAVE_IN_PROGRESS to SYNCED', () => {
    syncActor.send({ type: EVENT_SAVE_SUCCESS });

    expect(syncActor.getSnapshot().value).toBe(SYNCED);
  });

  it('should transition from SAVE_IN_PROGRESS to SAVE_ERROR', () => {
    syncActor.send({ type: EVENT_SAVE_ERROR });

    expect(syncActor.getSnapshot().value).toBe(SAVE_ERROR);
  });
});
