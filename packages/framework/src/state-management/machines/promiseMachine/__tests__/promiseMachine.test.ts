/// <reference types="jest" />
import { createActor } from 'xstate';

import { constants, createPromiseMachine } from '..';

const {
  EVENT_IDLE,
  EVENT_PENDING,
  EVENT_REJECT,
  EVENT_RESOLVE,
  STATUS_IDLE,
  STATUS_PENDING,
  STATUS_REJECTED,
  STATUS_RESOLVED,
} = constants;

describe('promiseMachine', () => {
  let promiseActor: ReturnType<typeof createActor<ReturnType<typeof createPromiseMachine>>>;

  beforeEach(() => {
    const promiseMachine = createPromiseMachine();

    promiseActor = createActor(promiseMachine);
    promiseActor.start();
  });

  it('should initially be in the idle state', () => {
    expect(promiseActor.getSnapshot().value).toBe(STATUS_IDLE);
    expect(promiseActor.getSnapshot().context).toEqual({});
  });

  it('should no transition to pending on some EVENT', () => {
    // Replace 'SOME_EVENT' with the actual event that triggers the transition to pending
    // @ts-expect-error
    promiseActor.send('SOME_EVENT');

    expect(promiseActor.getSnapshot().matches(STATUS_PENDING)).toBe(false);
  });

  it('should transition from NOT_AVAILABLE to AVAILABLE and set requesterMediaStream', () => {
    promiseActor.send({ type: EVENT_PENDING });

    expect(promiseActor.getSnapshot().value).toBe(STATUS_PENDING);
    expect(promiseActor.getSnapshot().context).toEqual({});
  });

  it('should transition to resolved on EVENT_RESOLVE', () => {
    promiseActor.send({ type: EVENT_PENDING }); // Must be pending before it can resolve
    promiseActor.send({ type: EVENT_RESOLVE, response: 'some data' });

    expect(promiseActor.getSnapshot().value).toBe(STATUS_RESOLVED);
  });

  it('should transition to rejected on EVENT_REJECT', () => {
    promiseActor.send({ type: EVENT_PENDING }); // Must be pending before it can reject
    promiseActor.send({ type: EVENT_REJECT, error: 'some error' });

    expect(promiseActor.getSnapshot().value).toBe(STATUS_REJECTED);
  });

  it('should transition back to idle on EVENT_IDLE from resolved', () => {
    promiseActor.send({ type: EVENT_PENDING });
    promiseActor.send({ type: EVENT_RESOLVE, response: 'some data' });
    promiseActor.send({ type: EVENT_IDLE });

    expect(promiseActor.getSnapshot().value).toBe(STATUS_IDLE);
  });

  it('should transition back to idle on EVENT_IDLE from rejected', () => {
    promiseActor.send({ type: EVENT_PENDING });
    promiseActor.send({ type: EVENT_REJECT, error: 'error' });
    promiseActor.send({ type: EVENT_IDLE });

    expect(promiseActor.getSnapshot().value).toBe(STATUS_IDLE);
  });
});
