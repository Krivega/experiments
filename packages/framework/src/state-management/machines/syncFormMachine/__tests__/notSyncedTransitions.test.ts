/// <reference types="jest" />
import { createActor } from 'xstate';

import { constants, syncFormMachine } from '..';

const {
  NOT_SYNCED,
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

describe('syncActor: transitions from init state', () => {
  let syncActor: ReturnType<typeof createActor<typeof syncFormMachine>>;

  beforeEach(() => {
    syncActor = createActor(syncFormMachine);
    syncActor.start();
  });

  it('should initially be NOT_SYNCED', () => {
    expect(syncActor.getSnapshot().value).toBe(NOT_SYNCED);
  });

  it('should not transition to SYNCED before EVENT_INIT', () => {
    syncActor.send({ type: EVENT_SYNC_SUCCESS });

    expect(syncActor.getSnapshot().matches(NOT_SYNCED)).toBe(true);
    expect(syncActor.getSnapshot().matches(SYNCED)).toBe(false);
  });

  it('should not transition to SYNC_ERROR before EVENT_INIT', () => {
    syncActor.send({ type: EVENT_SYNC_ERROR });

    expect(syncActor.getSnapshot().matches(NOT_SYNCED)).toBe(true);
    expect(syncActor.getSnapshot().matches(SYNC_ERROR)).toBe(false);
  });

  it('should not transition to NOT_SAVED before EVENT_INIT', () => {
    syncActor.send({ type: EVENT_CHANGE });

    expect(syncActor.getSnapshot().matches(NOT_SYNCED)).toBe(true);
    expect(syncActor.getSnapshot().matches(NOT_SAVED)).toBe(false);
  });

  it('should not transition to SAVE_IN_PROGRESS before EVENT_INIT', () => {
    syncActor.send({ type: EVENT_SAVE });

    expect(syncActor.getSnapshot().matches(NOT_SYNCED)).toBe(true);
    expect(syncActor.getSnapshot().matches(SAVE_IN_PROGRESS)).toBe(false);
  });

  it('should not transition to SYNCED directly before EVENT_INIT', () => {
    syncActor.send({ type: EVENT_SAVE_SUCCESS });

    expect(syncActor.getSnapshot().matches(NOT_SYNCED)).toBe(true);
    expect(syncActor.getSnapshot().matches(SYNCED)).toBe(false);
  });

  it('should not transition to SAVE_ERROR before EVENT_INIT', () => {
    syncActor.send({ type: EVENT_SAVE_ERROR });

    expect(syncActor.getSnapshot().matches(NOT_SYNCED)).toBe(true);
    expect(syncActor.getSnapshot().matches(SAVE_ERROR)).toBe(false);
  });

  it('should transition from NOT_SYNCED to SYNC_IN_PROGRESS', () => {
    syncActor.send({ type: EVENT_INIT });

    expect(syncActor.getSnapshot().value).toBe(SYNC_IN_PROGRESS);
  });
});
