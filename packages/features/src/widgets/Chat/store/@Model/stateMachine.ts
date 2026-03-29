import { createMachine } from 'xstate';

const MACHINE_ID = 'chat';

export const NOT_SYNCED = 'NOT_SYNCED' as const;
export const SYNC_IN_PROGRESS = 'SYNC_IN_PROGRESS' as const;
export const ACTIVE = 'ACTIVE' as const;
export const AVAILABLE = 'AVAILABLE' as const;
export const NOT_AVAILABLE = 'NOT_AVAILABLE' as const;
export const BANNED = 'BANNED' as const;

export const EVENT_NOT_SYNCED = 'EVENT_NOT_SYNCED' as const;
export const EVENT_SYNC_IN_PROGRESS = 'EVENT_SYNC_IN_PROGRESS' as const;
export const EVENT_NOT_AVAILABLE = 'EVENT_NOT_AVAILABLE' as const;
export const EVENT_AVAILABLE = 'EVENT_AVAILABLE' as const;
export const EVENT_ACTIVE = 'EVENT_ACTIVE' as const;
export const EVENT_BANNED = 'EVENT_BANNED' as const;

type TEvents = [
  { type: typeof EVENT_NOT_SYNCED },
  { type: typeof EVENT_SYNC_IN_PROGRESS },
  { type: typeof EVENT_NOT_AVAILABLE },
  { type: typeof EVENT_AVAILABLE },
  { type: typeof EVENT_ACTIVE },
  { type: typeof EVENT_BANNED },
][number];

const stateMachine = createMachine({
  types: {} as {
    events: TEvents;
  },
  id: MACHINE_ID,
  initial: NOT_SYNCED,
  states: {
    [NOT_SYNCED]: {
      on: {
        [EVENT_SYNC_IN_PROGRESS]: { target: SYNC_IN_PROGRESS },
      },
    },
    [SYNC_IN_PROGRESS]: {
      on: {
        [EVENT_NOT_SYNCED]: { target: NOT_SYNCED },
        [EVENT_NOT_AVAILABLE]: { target: NOT_AVAILABLE },
        [EVENT_AVAILABLE]: { target: AVAILABLE },
      },
    },
    [AVAILABLE]: {
      on: {
        [EVENT_ACTIVE]: { target: ACTIVE },
        [EVENT_NOT_AVAILABLE]: { target: NOT_AVAILABLE },
        [EVENT_NOT_SYNCED]: { target: NOT_SYNCED },
      },
    },
    [NOT_AVAILABLE]: {
      on: {
        [EVENT_NOT_SYNCED]: { target: NOT_SYNCED },
        [EVENT_AVAILABLE]: { target: AVAILABLE },
      },
    },
    [ACTIVE]: {
      on: {
        [EVENT_BANNED]: { target: BANNED },
        [EVENT_NOT_SYNCED]: { target: NOT_SYNCED },
        [EVENT_NOT_AVAILABLE]: { target: NOT_AVAILABLE },
      },
    },
    [BANNED]: {
      on: {
        [EVENT_ACTIVE]: { target: ACTIVE },
        [EVENT_NOT_SYNCED]: { target: NOT_SYNCED },
        [EVENT_NOT_AVAILABLE]: { target: NOT_AVAILABLE },
      },
    },
  },
});

export default stateMachine;
