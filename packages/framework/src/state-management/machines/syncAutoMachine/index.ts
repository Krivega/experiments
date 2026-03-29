import * as constantsExports from './syncAutoMachine';

export const constants = {
  NOT_SYNCED: constantsExports.NOT_SYNCED,
  SYNC_IN_PROGRESS: constantsExports.SYNC_IN_PROGRESS,
  SYNCED: constantsExports.SYNCED,
  SYNC_ERROR: constantsExports.SYNC_ERROR,
  SYNC_RETRY: constantsExports.SYNC_RETRY,

  NOT_SAVED: constantsExports.NOT_SAVED,
  SAVE_IN_PROGRESS: constantsExports.SAVE_IN_PROGRESS,
  SAVE_ERROR: constantsExports.SAVE_ERROR,

  EVENT_START_SYNC: constantsExports.EVENT_START_SYNC,
  EVENT_SYNC_SUCCESS: constantsExports.EVENT_SYNC_SUCCESS,
  EVENT_SYNC_ERROR: constantsExports.EVENT_SYNC_ERROR,
  EVENT_SYNC_RETRY: constantsExports.EVENT_SYNC_RETRY,

  EVENT_CHANGE: constantsExports.EVENT_CHANGE,
  EVENT_CANCEL: constantsExports.EVENT_CANCEL,
  EVENT_SAVE: constantsExports.EVENT_SAVE,
  EVENT_SAVE_SUCCESS: constantsExports.EVENT_SAVE_SUCCESS,
  EVENT_SAVE_ERROR: constantsExports.EVENT_SAVE_ERROR,
};

export { default as syncAutoMachine } from './syncAutoMachine';
