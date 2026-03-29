import { resolveSetter } from '@experiments/mst-tools';
import { types as typesMST } from 'mobx-state-tree';
import { createActor } from 'xstate';

import { syncMachineConstantsDeprecated, syncMachineDeprecated } from '../../machines';

import type { TInstanceModel } from '@experiments/mst-tools';

const {
  EVENT_NOT_SYNCED,
  EVENT_SYNC_ERROR,
  EVENT_SYNC_IN_PROGRESS,
  EVENT_SYNC_REPEATED,
  EVENT_SYNCED,
  NOT_SYNCED,
  SYNC_ERROR,
  SYNC_IN_PROGRESS,
  SYNC_REPEATED,
  SYNCED,
} = syncMachineConstantsDeprecated;

/**
 * The base model for model sync.
 *
 * @deprecated Use the new model `ModelSync` instead.
 */
const ModelSyncDeprecated = typesMST
  .model({})
  .volatile(() => {
    const actor = createActor(syncMachineDeprecated);

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

      get isSyncRepeated() {
        return self.state.value === SYNC_REPEATED;
      },

      get isReady() {
        return this.isSyncError || this.isSynced;
      },

      get error() {
        return self.state.context.error;
      },
    };
  })
  .actions((self) => {
    const resolveSelfSetter = resolveSetter(self);
    const setSyncState = resolveSelfSetter<'state'>('state');

    const setNotSynced = () => {
      self.actor.send({ type: EVENT_NOT_SYNCED });
    };

    const setSyncInProgress = () => {
      self.actor.send({ type: EVENT_SYNC_IN_PROGRESS });
    };

    const setSynced = () => {
      self.actor.send({ type: EVENT_SYNCED });
    };

    const setSyncError = (error?: unknown) => {
      self.actor.send({ type: EVENT_SYNC_ERROR, error });
    };

    const setSyncRepeated = () => {
      self.actor.send({ type: EVENT_SYNC_REPEATED });
    };

    return {
      setSynced,
      setNotSynced,
      setSyncInProgress,
      setSyncError,
      setSyncRepeated,

      afterCreate() {
        self.actor.subscribe(setSyncState);
        self.actor.start();
      },

      beforeDestroy() {
        self.actor.stop();
      },
    };
  });

export type TSyncStoreDeprecated = TInstanceModel<typeof ModelSyncDeprecated>;

export default ModelSyncDeprecated;
