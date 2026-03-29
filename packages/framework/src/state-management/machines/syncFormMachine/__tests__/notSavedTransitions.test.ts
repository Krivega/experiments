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
  EVENT_VALIDATION_ERROR,
  NOT_SAVED,
  NOT_VALID,
  SAVE_ERROR,
  SAVE_IN_PROGRESS,
  SYNCED,
  SYNC_ERROR,
  SYNC_IN_PROGRESS,
} = constants;

describe('syncActor: transitions from NOT_SAVED', () => {
  let syncActor: ReturnType<typeof createActor<typeof syncFormMachine>>;

  beforeEach(() => {
    syncActor = createActor(syncFormMachine);
    syncActor.start();
    syncActor.send({ type: EVENT_INIT });
    syncActor.send({ type: EVENT_SYNC_SUCCESS });
    syncActor.send({ type: EVENT_CHANGE });
  });

  it('should initially be NOT_SAVED', () => {
    expect(syncActor.getSnapshot().value).toBe(NOT_SAVED);
  });

  it('should not transition to SYNC_IN_PROGRESS', () => {
    syncActor.send({ type: EVENT_INIT });

    expect(syncActor.getSnapshot().matches(NOT_SAVED)).toBe(true);
    expect(syncActor.getSnapshot().matches(SYNC_IN_PROGRESS)).toBe(false);
  });

  it('should not transition to SYNC_ERROR', () => {
    syncActor.send({ type: EVENT_SYNC_ERROR });

    expect(syncActor.getSnapshot().matches(NOT_SAVED)).toBe(true);
    expect(syncActor.getSnapshot().matches(SYNC_ERROR)).toBe(false);
  });

  it('should not transition to SYNCED before SAVE_IN_PROGRESS', () => {
    syncActor.send({ type: EVENT_SAVE_SUCCESS });

    expect(syncActor.getSnapshot().matches(NOT_SAVED)).toBe(true);
    expect(syncActor.getSnapshot().matches(SYNCED)).toBe(false);
  });

  it('should not transition to SAVE_ERROR before SAVE_IN_PROGRESS', () => {
    syncActor.send({ type: EVENT_SAVE_ERROR });

    expect(syncActor.getSnapshot().matches(NOT_SAVED)).toBe(true);
    expect(syncActor.getSnapshot().matches(SAVE_ERROR)).toBe(false);
  });

  it('should transition from NOT_SAVED to SYNCED', () => {
    syncActor.send({ type: EVENT_CANCEL });

    expect(syncActor.getSnapshot().matches(SYNCED)).toBe(true);
  });

  it('should transition from NOT_SAVED to NOT_VALID', () => {
    syncActor.send({ type: EVENT_VALIDATION_ERROR });

    expect(syncActor.getSnapshot().value).toBe(NOT_VALID);
  });

  it('should transition from NOT_SAVED to SAVE_IN_PROGRESS', () => {
    syncActor.send({ type: EVENT_SAVE });

    expect(syncActor.getSnapshot().value).toBe(SAVE_IN_PROGRESS);
  });
});
