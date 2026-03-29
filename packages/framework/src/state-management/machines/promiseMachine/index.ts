import {
  EVENT_IDLE,
  EVENT_PENDING,
  EVENT_REJECT,
  EVENT_RESOLVE,
  STATUS_IDLE,
  STATUS_PENDING,
  STATUS_REJECTED,
  STATUS_RESOLVED,
} from './promiseMachine';

export const constants = {
  EVENT_IDLE,
  EVENT_PENDING,
  EVENT_REJECT,
  EVENT_RESOLVE,
  STATUS_IDLE,
  STATUS_PENDING,
  STATUS_REJECTED,
  STATUS_RESOLVED,
};

export { default as createPromiseMachine } from './promiseMachine';
