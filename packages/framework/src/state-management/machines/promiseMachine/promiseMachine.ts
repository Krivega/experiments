import { assign, createMachine } from 'xstate';

type TContext<T = unknown> = {
  response?: T;
  error?: string;
};

const MACHINE_ID = 'promise';

export const STATUS_IDLE = 'idle' as const;
export const STATUS_PENDING = 'pending' as const;
export const STATUS_RESOLVED = 'resolved' as const;
export const STATUS_REJECTED = 'rejected' as const;

export const EVENT_IDLE = 'IDLE' as const;
export const EVENT_PENDING = 'PENDING' as const;
export const EVENT_RESOLVE = 'RESOLVE' as const;
export const EVENT_REJECT = 'REJECT' as const;

const createPromiseMachine = <T>(initialState: TContext<T> = {}) => {
  const machine = createMachine({
    id: MACHINE_ID,
    context: initialState,
    // predictableActionArguments: true,
    initial: STATUS_IDLE,
    states: {
      [STATUS_IDLE]: {
        on: {
          [EVENT_PENDING]: {
            target: STATUS_PENDING,
          },
        },
      },
      [STATUS_PENDING]: {
        on: {
          [EVENT_RESOLVE]: {
            target: STATUS_RESOLVED,
            actions: [
              assign(({ event }) => {
                return { response: event.response as T };
              }),
            ],
          },
          [EVENT_REJECT]: {
            target: STATUS_REJECTED,
            actions: [
              assign(({ event }) => {
                return { error: event.error as string };
              }),
            ],
          },
        },
      },
      [STATUS_RESOLVED]: {
        on: {
          [EVENT_IDLE]: {
            target: STATUS_IDLE,
            actions: [
              assign(() => {
                return { response: undefined };
              }),
            ],
          },
        },
      },
      [STATUS_REJECTED]: {
        on: {
          [EVENT_IDLE]: {
            target: STATUS_IDLE,
            actions: [
              assign(() => {
                return { error: undefined };
              }),
            ],
          },
        },
      },
    },
  });

  return machine;
};

export type TPromiseMachine<T> = ReturnType<typeof createPromiseMachine<T>>;

export default createPromiseMachine;
