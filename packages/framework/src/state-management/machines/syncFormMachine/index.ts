import * as constantsExports from './syncFormMachine';

export const constants = {
  NOT_SYNCED: constantsExports.NOT_SYNCED,
  SYNC_IN_PROGRESS: constantsExports.SYNC_IN_PROGRESS,
  SYNCED: constantsExports.SYNCED,
  SYNC_ERROR: constantsExports.SYNC_ERROR,

  NOT_SAVED: constantsExports.NOT_SAVED,
  NOT_VALID: constantsExports.NOT_VALID,
  SAVE_IN_PROGRESS: constantsExports.SAVE_IN_PROGRESS,
  SAVE_ERROR: constantsExports.SAVE_ERROR,

  EVENT_INIT: constantsExports.EVENT_INIT,
  EVENT_SYNC_SUCCESS: constantsExports.EVENT_SYNC_SUCCESS,
  EVENT_SYNC_ERROR: constantsExports.EVENT_SYNC_ERROR,

  EVENT_CHANGE: constantsExports.EVENT_CHANGE,
  EVENT_VALIDATION_ERROR: constantsExports.EVENT_VALIDATION_ERROR,
  EVENT_CANCEL: constantsExports.EVENT_CANCEL,
  EVENT_SAVE: constantsExports.EVENT_SAVE,
  EVENT_SAVE_SUCCESS: constantsExports.EVENT_SAVE_SUCCESS,
  EVENT_SAVE_ERROR: constantsExports.EVENT_SAVE_ERROR,
};

export { default as syncFormMachine } from './syncFormMachine';
