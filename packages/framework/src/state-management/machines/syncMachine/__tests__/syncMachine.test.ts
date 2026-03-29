/// <reference types="jest" />
import { createActor } from 'xstate';

import { constants, syncMachine } from '..';

const {
  EVENT_START_SYNC,
  EVENT_SYNC_ERROR,
  EVENT_SYNC_RETRY,
  EVENT_SYNC_SUCCESS,
  NOT_SYNCED,
  SYNCED,
  SYNC_ERROR,
  SYNC_IN_PROGRESS,
  SYNC_RETRY,
} = constants;

describe('syncActor', () => {
  let syncActor: ReturnType<typeof createActor<typeof syncMachine>>;

  beforeEach(() => {
    syncActor = createActor(syncMachine);
    syncActor.start();
  });

  it('должно изначально находиться в состоянии NOT_SYNCED', () => {
    expect(syncActor.getSnapshot().value).toBe(NOT_SYNCED);
  });

  it('не должно переходить в состояние SYNCED до начала SYNC_IN_PROGRESS', () => {
    syncActor.send({ type: EVENT_SYNC_SUCCESS });

    expect(syncActor.getSnapshot().matches(NOT_SYNCED)).toBe(true);
    expect(syncActor.getSnapshot().matches(SYNCED)).toBe(false);
  });

  it('не должно переходить в состояние SYNC_ERROR до начала SYNC_IN_PROGRESS', () => {
    syncActor.send({ type: EVENT_SYNC_ERROR });

    expect(syncActor.getSnapshot().matches(NOT_SYNCED)).toBe(true);
    expect(syncActor.getSnapshot().matches(SYNC_ERROR)).toBe(false);
  });

  it('должно переходить из состояния NOT_SYNCED в состояние SYNC_IN_PROGRESS', () => {
    syncActor.send({ type: EVENT_START_SYNC });

    expect(syncActor.getSnapshot().value).toBe(SYNC_IN_PROGRESS);
  });

  it('не должно переходить из состояния SYNCED куда-либо', () => {
    syncActor.send({ type: EVENT_START_SYNC });
    syncActor.send({ type: EVENT_SYNC_SUCCESS });
    syncActor.send({ type: EVENT_START_SYNC });

    expect(syncActor.getSnapshot().value).toBe(SYNCED);
  });

  it('должно переходить из состояния SYNC_ERROR  куда-либо', () => {
    syncActor.send({ type: EVENT_START_SYNC });
    syncActor.send({ type: EVENT_SYNC_ERROR });
    syncActor.send({ type: EVENT_START_SYNC });

    expect(syncActor.getSnapshot().value).toBe(SYNC_ERROR);
  });

  it('должно переходить из состояния SYNC_IN_PROGRESS в состояние SYNCED', () => {
    syncActor.send({ type: EVENT_START_SYNC });
    syncActor.send({ type: EVENT_SYNC_SUCCESS });

    expect(syncActor.getSnapshot().value).toBe(SYNCED);
  });

  it('должно переходить из состояния SYNC_IN_PROGRESS в состояние SYNC_ERROR', () => {
    syncActor.send({ type: EVENT_START_SYNC });
    syncActor.send({ type: EVENT_SYNC_ERROR });

    expect(syncActor.getSnapshot().value).toBe(SYNC_ERROR);
  });

  it('должно переходить из состояния SYNC_IN_PROGRESS в состояние SYNC_RETRY', () => {
    syncActor.send({ type: EVENT_START_SYNC });
    syncActor.send({ type: EVENT_SYNC_RETRY });

    expect(syncActor.getSnapshot().value).toBe(SYNC_RETRY);
  });
  it('должно переходить из состояния SYNC_RETRY в состояние SYNCED', () => {
    syncActor.send({ type: EVENT_START_SYNC });
    syncActor.send({ type: EVENT_SYNC_RETRY });
    syncActor.send({ type: EVENT_SYNC_SUCCESS });

    expect(syncActor.getSnapshot().value).toBe(SYNCED);
  });

  it('должно переходить из состояния SYNC_RETRY в состояние SYNC_ERROR', () => {
    syncActor.send({ type: EVENT_START_SYNC });
    syncActor.send({ type: EVENT_SYNC_RETRY });
    syncActor.send({ type: EVENT_SYNC_ERROR });

    expect(syncActor.getSnapshot().value).toBe(SYNC_ERROR);
  });

  it('не должно переходить из состояния SYNCED в состояние SYNC_RETRY', () => {
    syncActor.send({ type: EVENT_START_SYNC });
    syncActor.send({ type: EVENT_SYNC_SUCCESS });
    syncActor.send({ type: EVENT_SYNC_RETRY });

    expect(syncActor.getSnapshot().value).toBe(SYNCED);
  });

  it('не должно переходить из состояния SYNC_ERROR в состояние SYNC_RETRY', () => {
    syncActor.send({ type: EVENT_START_SYNC });
    syncActor.send({ type: EVENT_SYNC_ERROR });
    syncActor.send({ type: EVENT_SYNC_RETRY });

    expect(syncActor.getSnapshot().value).toBe(SYNC_ERROR);
  });

  it('должно устанавливать сообщение об ошибке', () => {
    syncActor.send({ type: EVENT_START_SYNC });
    syncActor.send({ type: EVENT_SYNC_ERROR, error: 'error' });

    expect(syncActor.getSnapshot().value).toBe(SYNC_ERROR);
    expect(syncActor.getSnapshot().context.error).toBe('error');
  });
});
