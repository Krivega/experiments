import { assign, createMachine } from 'xstate';

const MACHINE_ID = 'sync-form';

export const NOT_SYNCED = 'NOT_SYNCED' as const;
export const SYNC_IN_PROGRESS = 'SYNC_IN_PROGRESS' as const;
export const SYNCED = 'SYNCED' as const;
export const SYNC_ERROR = 'SYNC_ERROR' as const;

export const NOT_SAVED = 'NOT_SAVED' as const;
export const NOT_VALID = 'NOT_VALID' as const;
export const SAVE_IN_PROGRESS = 'SAVE_IN_PROGRESS' as const;
export const SAVE_ERROR = 'SAVE_ERROR' as const;

export const EVENT_INIT = 'EVENT_INIT' as const;
export const EVENT_SYNC_SUCCESS = 'EVENT_SYNC_SUCCESS' as const;
export const EVENT_SYNC_ERROR = 'EVENT_SYNC_ERROR' as const;

export const EVENT_CHANGE = 'EVENT_CHANGE' as const;
export const EVENT_VALIDATION_ERROR = 'EVENT_VALIDATION_ERROR' as const;
export const EVENT_CANCEL = 'EVENT_CANCEL' as const;
export const EVENT_SAVE = 'EVENT_SAVE' as const;
export const EVENT_SAVE_SUCCESS = 'EVENT_SAVE_SUCCESS' as const;
export const EVENT_SAVE_ERROR = 'EVENT_SAVE_ERROR' as const;

type TContext = {
  error?: unknown;
};

const syncFormMachine = createMachine({
  types: {} as {
    context: TContext;
    events:
      | { type: 'EVENT_INIT' }
      | { type: 'EVENT_SYNC_SUCCESS' }
      | { type: 'EVENT_SYNC_ERROR'; error?: unknown }
      | { type: 'EVENT_CHANGE' }
      | { type: 'EVENT_VALIDATION_ERROR' }
      | { type: 'EVENT_CANCEL' }
      | { type: 'EVENT_SAVE' }
      | { type: 'EVENT_SAVE_SUCCESS' }
      | { type: 'EVENT_SAVE_ERROR'; error?: unknown };
  },
  id: MACHINE_ID,
  initial: NOT_SYNCED,
  context: { error: undefined } as TContext,
  states: {
    [NOT_SYNCED]: {
      on: {
        [EVENT_INIT]: { target: SYNC_IN_PROGRESS },
      },
    },
    [SYNC_IN_PROGRESS]: {
      on: {
        [EVENT_SYNC_SUCCESS]: { target: SYNCED },
        [EVENT_SYNC_ERROR]: {
          target: SYNC_ERROR,
          actions: assign({
            error: ({ event }) => {
              return event.error;
            },
          }),
        },
      },
    },
    [SYNC_ERROR]: {},
    [SYNCED]: {
      on: {
        [EVENT_CHANGE]: { target: NOT_SAVED },
      },
    },
    [NOT_SAVED]: {
      on: {
        [EVENT_SAVE]: { target: SAVE_IN_PROGRESS },
        [EVENT_CANCEL]: { target: SYNCED },
        [EVENT_VALIDATION_ERROR]: { target: NOT_VALID },
      },
    },
    [NOT_VALID]: {
      on: {
        [EVENT_CHANGE]: { target: NOT_SAVED },
        [EVENT_CANCEL]: { target: SYNCED },
      },
    },
    [SAVE_IN_PROGRESS]: {
      on: {
        [EVENT_SAVE_SUCCESS]: { target: SYNCED },
        [EVENT_SAVE_ERROR]: {
          target: SAVE_ERROR,
          actions: assign({
            error: ({ event }) => {
              return event.error;
            },
          }),
        },
      },
    },
    [SAVE_ERROR]: {
      on: {
        [EVENT_CHANGE]: { target: NOT_SAVED },
        [EVENT_SAVE]: { target: SAVE_IN_PROGRESS },
        [EVENT_CANCEL]: { target: SYNCED },
      },
    },
  },
});

export default syncFormMachine;
