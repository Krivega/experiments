/// <reference types="jest" />
import { createActor } from 'xstate';

import { constants, syncMachineDeprecated } from '..';

const {
  EVENT_NOT_SYNCED,
  EVENT_SYNCED,
  EVENT_SYNC_ERROR,
  EVENT_SYNC_IN_PROGRESS,
  NOT_SYNCED,
  SYNCED,
  SYNC_ERROR,
  SYNC_IN_PROGRESS,
} = constants;

describe('syncActor', () => {
  let syncActor: ReturnType<typeof createActor<typeof syncMachineDeprecated>>;

  beforeEach(() => {
    syncActor = createActor(syncMachineDeprecated);
    syncActor.start();
  });

  it('should initially be in the not synced state', () => {
    expect(syncActor.getSnapshot().value).toBe(NOT_SYNCED);
  });

  it('should not transition to synced before sync in progress', () => {
    syncActor.send({ type: EVENT_SYNCED });

    expect(syncActor.getSnapshot().matches(NOT_SYNCED)).toBe(true);
    expect(syncActor.getSnapshot().matches(SYNCED)).toBe(false);
  });

  it('should not transition to error before sync in progress', () => {
    syncActor.send({ type: EVENT_SYNC_ERROR });

    expect(syncActor.getSnapshot().matches(NOT_SYNCED)).toBe(true);
    expect(syncActor.getSnapshot().matches(SYNC_ERROR)).toBe(false);
  });

  it('should transition from NOT_SYNCED to SYNC_IN_PROGRESS', () => {
    syncActor.send({ type: EVENT_SYNC_IN_PROGRESS });

    expect(syncActor.getSnapshot().value).toBe(SYNC_IN_PROGRESS);
  });

  it('should transition from SYNCED to SYNC_IN_PROGRESS', () => {
    syncActor.send({ type: EVENT_SYNC_IN_PROGRESS });
    syncActor.send({ type: EVENT_SYNCED });
    syncActor.send({ type: EVENT_SYNC_IN_PROGRESS });

    expect(syncActor.getSnapshot().value).toBe(SYNC_IN_PROGRESS);
  });

  it('should transition from SYNC_ERROR to SYNC_IN_PROGRESS', () => {
    syncActor.send({ type: EVENT_SYNC_IN_PROGRESS });
    syncActor.send({ type: EVENT_SYNC_ERROR });
    syncActor.send({ type: EVENT_SYNC_IN_PROGRESS });

    expect(syncActor.getSnapshot().value).toBe(SYNC_IN_PROGRESS);
  });

  it('should transition from SYNC_IN_PROGRESS to SYNCED', () => {
    syncActor.send({ type: EVENT_SYNC_IN_PROGRESS });
    syncActor.send({ type: EVENT_SYNCED });

    expect(syncActor.getSnapshot().value).toBe(SYNCED);
  });

  it('should transition from SYNC_IN_PROGRESS to NOT_SYNCED', () => {
    syncActor.send({ type: EVENT_SYNC_IN_PROGRESS });
    syncActor.send({ type: EVENT_NOT_SYNCED });

    expect(syncActor.getSnapshot().value).toBe(NOT_SYNCED);
  });
  it('should transition from SYNC_IN_PROGRESS to SYNC_ERROR', () => {
    syncActor.send({ type: EVENT_SYNC_IN_PROGRESS });
    syncActor.send({ type: EVENT_SYNC_ERROR });

    expect(syncActor.getSnapshot().value).toBe(SYNC_ERROR);
  });

  it('should not transition from SYNCED to NOT_SYNCED', () => {
    syncActor.send({ type: EVENT_SYNC_IN_PROGRESS });
    syncActor.send({ type: EVENT_SYNCED });
    syncActor.send({ type: EVENT_NOT_SYNCED });

    expect(syncActor.getSnapshot().value).toBe(SYNCED);
  });
  it('should not transition from SYNC_ERROR to NOT_SYNCED', () => {
    syncActor.send({ type: EVENT_SYNC_IN_PROGRESS });
    syncActor.send({ type: EVENT_SYNC_ERROR });
    syncActor.send({ type: EVENT_NOT_SYNCED });

    expect(syncActor.getSnapshot().value).toBe(SYNC_ERROR);
  });

  it('should set error message', () => {
    syncActor.send({ type: EVENT_SYNC_IN_PROGRESS });
    syncActor.send({ type: EVENT_SYNC_ERROR, error: 'error' });

    expect(syncActor.getSnapshot().value).toBe(SYNC_ERROR);
    expect(syncActor.getSnapshot().context.error).toBe('error');
  });
});
