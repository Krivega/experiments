import {
  EVENT_START_SYNC,
  EVENT_SYNC_ERROR,
  EVENT_SYNC_RETRY,
  EVENT_SYNC_SUCCESS,
  NOT_SYNCED,
  SYNC_ERROR,
  SYNC_IN_PROGRESS,
  SYNC_RETRY,
  SYNCED,
} from './syncMachine';

export const constants = {
  EVENT_START_SYNC,
  EVENT_SYNC_ERROR,
  EVENT_SYNC_RETRY,
  EVENT_SYNC_SUCCESS,
  NOT_SYNCED,
  SYNC_ERROR,
  SYNC_IN_PROGRESS,
  SYNCED,
  SYNC_RETRY,
};

export { default as syncMachine } from './syncMachine';
