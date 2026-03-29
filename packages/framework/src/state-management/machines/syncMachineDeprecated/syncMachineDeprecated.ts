import { assign, createMachine } from 'xstate';

const MACHINE_ID = 'sync';

export const NOT_SYNCED = 'NOT_SYNCED' as const;
export const SYNC_IN_PROGRESS = 'SYNC_IN_PROGRESS' as const;
export const SYNCED = 'SYNCED' as const;
export const SYNC_ERROR = 'SYNC_ERROR' as const;
export const SYNC_REPEATED = 'SYNC_REPEATED' as const;

export const EVENT_NOT_SYNCED = 'EVENT_NOT_SYNCED' as const;
export const EVENT_SYNC_IN_PROGRESS = 'EVENT_SYNC_IN_PROGRESS' as const;
export const EVENT_SYNCED = 'EVENT_SYNCED' as const;
export const EVENT_SYNC_ERROR = 'EVENT_SYNC_ERROR' as const;
export const EVENT_SYNC_REPEATED = 'EVENT_SYNC_REPEATED' as const;

type TContext = {
  error?: unknown;
};

const syncMachineDeprecated = createMachine({
  types: {} as {
    context: TContext;
    events:
      | { type: 'EVENT_NOT_SYNCED' }
      | { type: 'EVENT_SYNC_IN_PROGRESS' }
      | { type: 'EVENT_SYNCED' }
      | { type: 'EVENT_SYNC_ERROR'; error?: unknown }
      | { type: 'EVENT_SYNC_REPEATED' };
  },

  id: MACHINE_ID,
  initial: NOT_SYNCED,
  context: {
    error: undefined,
  } as TContext,
  states: {
    [NOT_SYNCED]: {
      on: {
        [EVENT_SYNC_IN_PROGRESS]: { target: SYNC_IN_PROGRESS },
      },
    },
    [SYNC_IN_PROGRESS]: {
      on: {
        [EVENT_NOT_SYNCED]: { target: NOT_SYNCED },
        [EVENT_SYNCED]: { target: SYNCED },
        [EVENT_SYNC_REPEATED]: { target: SYNC_REPEATED },
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
    [SYNCED]: {
      on: {
        [EVENT_SYNC_IN_PROGRESS]: { target: SYNC_IN_PROGRESS },
      },
    },
    [SYNC_ERROR]: {
      on: {
        [EVENT_SYNC_IN_PROGRESS]: {
          target: SYNC_IN_PROGRESS,
          actions: assign({ error: undefined }),
        },
      },
    },
    [SYNC_REPEATED]: {
      on: {
        [EVENT_SYNCED]: { target: SYNCED },
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
  },
});

export default syncMachineDeprecated;
