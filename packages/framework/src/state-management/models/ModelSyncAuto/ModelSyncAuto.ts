import { resolveSetter } from '@experiments/mst-tools';
import { types as typesMST } from 'mobx-state-tree';
import { createActor } from 'xstate';

import { syncAutoMachine, syncAutoMachineConstants } from '../../machines';

import type { TInstanceModel } from '@experiments/mst-tools';

const {
  EVENT_CHANGE,
  EVENT_SAVE,
  EVENT_SAVE_ERROR,
  EVENT_SAVE_SUCCESS,
  EVENT_SYNC_ERROR,
  EVENT_START_SYNC,
  EVENT_SYNC_SUCCESS,
  EVENT_CANCEL,
  EVENT_SYNC_RETRY,
  NOT_SAVED,
  NOT_SYNCED,
  SYNC_RETRY,
  SAVE_ERROR,
  SAVE_IN_PROGRESS,
  SYNC_ERROR,
  SYNC_IN_PROGRESS,
  SYNCED,
} = syncAutoMachineConstants;

// Типы событий для корректной работы с машиной состояний
type TSyncAutoEvent =
  | { type: typeof EVENT_START_SYNC }
  | { type: typeof EVENT_SYNC_SUCCESS }
  | { type: typeof EVENT_SYNC_RETRY }
  | { type: typeof EVENT_SYNC_ERROR; error?: unknown }
  | { type: typeof EVENT_CHANGE }
  | { type: typeof EVENT_SAVE }
  | { type: typeof EVENT_SAVE_SUCCESS }
  | { type: typeof EVENT_SAVE_ERROR; error?: unknown }
  | { type: typeof EVENT_CANCEL };

const ModelSyncAuto = typesMST
  .model({})
  .volatile(() => {
    const actor = createActor(syncAutoMachine);

    return {
      actor,
      state: actor.getSnapshot(),
    };
  })
  .views((self) => {
    return {
      get isNotSynced() {
        return self.state.value === NOT_SYNCED;
      },

      get isSyncInProgress() {
        return self.state.value === SYNC_IN_PROGRESS;
      },

      get isSynced() {
        return self.state.value === SYNCED;
      },

      get isSyncError() {
        return self.state.value === SYNC_ERROR;
      },

      get isSyncRetry() {
        return self.state.value === SYNC_RETRY;
      },

      get isNotSaved() {
        return self.state.value === NOT_SAVED;
      },

      get isSaveInProgress() {
        return self.state.value === SAVE_IN_PROGRESS;
      },

      get isSaveError() {
        return self.state.value === SAVE_ERROR;
      },

      get error() {
        return self.state.context.error;
      },
    };
  })
  .views((self) => {
    return {
      get isSyncReady() {
        return self.isSynced || self.isSaveError;
      },

      get isLoading() {
        return self.isSyncInProgress || self.isSyncRetry;
      },

      get isNotReady() {
        return self.isNotSynced || this.isLoading;
      },

      get isSaveAllowed() {
        return self.isNotSaved || self.isSaveError;
      },

      canSave() {
        // TODO: сделать фикс (https://@experiments.kaiten.ru/space/70005/boards/card/49829704)
        return this.isSaveAllowed;
      },
    };
  })
  .actions((self) => {
    const resolveSelfSetter = resolveSetter(self);
    const setSyncState = resolveSelfSetter<'state'>('state');

    const setSyncInProgress = () => {
      self.actor.send({ type: EVENT_START_SYNC } as TSyncAutoEvent);
    };

    const setSynced = () => {
      self.actor.send({ type: EVENT_SYNC_SUCCESS } as TSyncAutoEvent);
    };

    const setSyncError = (error?: unknown) => {
      self.actor.send({ type: EVENT_SYNC_ERROR, error } as TSyncAutoEvent);
    };

    const setSyncRetry = () => {
      self.actor.send({ type: EVENT_SYNC_RETRY } as TSyncAutoEvent);
    };

    const setNotSaved = () => {
      self.actor.send({ type: EVENT_CHANGE } as TSyncAutoEvent);
    };

    const setSaveInProgress = () => {
      self.actor.send({ type: EVENT_SAVE } as TSyncAutoEvent);
    };

    const setSaved = () => {
      self.actor.send({ type: EVENT_SAVE_SUCCESS } as TSyncAutoEvent);
    };

    const setSaveError = (error?: unknown) => {
      self.actor.send({ type: EVENT_SAVE_ERROR, error } as TSyncAutoEvent);
    };

    const cancelChanges = () => {
      self.actor.send({ type: EVENT_CANCEL } as TSyncAutoEvent);
    };

    return {
      setSynced,
      setSyncInProgress,
      setSyncError,
      setSyncRetry,

      setNotSaved,
      setSaveInProgress,
      setSaved,
      setSaveError,
      cancelChanges,

      afterCreate() {
        self.actor.subscribe(setSyncState);
        self.actor.start();
      },

      beforeDestroy() {
        self.actor.stop();
      },
    };
  });

export type TInstanceSyncAuto = TInstanceModel<typeof ModelSyncAuto>;

export default ModelSyncAuto;
