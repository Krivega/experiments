import { resolveSetter } from '@experiments/mst-tools';
import { types as typesMST } from 'mobx-state-tree';
import { createActor } from 'xstate';

import { syncFormMachine, syncFormMachineConstants } from '../../machines';

import type { TInstanceModel } from '@experiments/mst-tools';

const {
  EVENT_CHANGE,
  EVENT_SAVE,
  EVENT_SAVE_ERROR,
  EVENT_SAVE_SUCCESS,
  EVENT_SYNC_ERROR,
  EVENT_INIT,
  EVENT_SYNC_SUCCESS,
  EVENT_CANCEL,
  EVENT_VALIDATION_ERROR,
  NOT_SAVED,
  NOT_SYNCED,
  NOT_VALID,
  SAVE_ERROR,
  SAVE_IN_PROGRESS,
  SYNC_ERROR,
  SYNC_IN_PROGRESS,
  SYNCED,
} = syncFormMachineConstants;

// Типы событий для корректной работы с машиной состояний
type TSyncFormEvent =
  | { type: typeof EVENT_INIT }
  | { type: typeof EVENT_SYNC_SUCCESS }
  | { type: typeof EVENT_SYNC_ERROR; error?: unknown }
  | { type: typeof EVENT_CHANGE }
  | { type: typeof EVENT_VALIDATION_ERROR }
  | { type: typeof EVENT_SAVE }
  | { type: typeof EVENT_SAVE_SUCCESS }
  | { type: typeof EVENT_SAVE_ERROR; error?: unknown }
  | { type: typeof EVENT_CANCEL };

const ModelSyncForm = typesMST
  .model({})
  .volatile(() => {
    const actor = createActor(syncFormMachine);

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

      get isNotSaved() {
        return self.state.value === NOT_SAVED;
      },

      get isNotValid() {
        return self.state.value === NOT_VALID;
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
        return self.isSynced || self.isSyncError;
      },

      get isNotReady() {
        return self.isNotSynced || self.isSyncInProgress;
      },

      get isSaveAllowed() {
        return self.isNotSaved || self.isSaveError;
      },

      get isCancelAllowed() {
        return this.isSaveAllowed || self.isNotValid;
      },

      canSave() {
        // TODO: сделать фикс (https://@experiments.kaiten.ru/space/70005/boards/card/49829704)
        return this.isSaveAllowed;
      },
      canReset() {
        return this.isCancelAllowed;
      },
    };
  })
  .actions((self) => {
    const resolveSelfSetter = resolveSetter(self);
    const setSyncState = resolveSelfSetter<'state'>('state');

    const setSyncInProgress = () => {
      self.actor.send({ type: EVENT_INIT } as TSyncFormEvent);
    };

    const setSynced = () => {
      self.actor.send({ type: EVENT_SYNC_SUCCESS } as TSyncFormEvent);
    };

    const setSyncError = (error?: unknown) => {
      self.actor.send({ type: EVENT_SYNC_ERROR, error } as TSyncFormEvent);
    };

    const setNotSaved = () => {
      self.actor.send({ type: EVENT_CHANGE } as TSyncFormEvent);
    };

    const setSaveInProgress = () => {
      self.actor.send({ type: EVENT_SAVE } as TSyncFormEvent);
    };

    const setSaved = () => {
      self.actor.send({ type: EVENT_SAVE_SUCCESS } as TSyncFormEvent);
    };

    const setSaveError = (error?: unknown) => {
      self.actor.send({ type: EVENT_SAVE_ERROR, error } as TSyncFormEvent);
    };

    const setNotValid = () => {
      self.actor.send({ type: EVENT_VALIDATION_ERROR } as TSyncFormEvent);
    };

    const cancelChanges = () => {
      self.actor.send({ type: EVENT_CANCEL } as TSyncFormEvent);
    };

    return {
      setSynced,
      setSyncInProgress,
      setSyncError,

      setNotSaved,
      setNotValid,
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

export type TSyncFormStore = TInstanceModel<typeof ModelSyncForm>;

export default ModelSyncForm;
