import { resolveSetter } from '@experiments/mst-tools';
import { types as typesMST } from 'mobx-state-tree';
import { createActor } from 'xstate';

import { syncMachine, syncMachineConstants } from '../../machines';

import type { TInstanceModel } from '@experiments/mst-tools';

const {
  EVENT_SYNC_ERROR,
  EVENT_SYNC_SUCCESS,
  NOT_SYNCED,
  SYNC_ERROR,
  SYNC_IN_PROGRESS,
  SYNCED,
  EVENT_START_SYNC,
  EVENT_SYNC_RETRY,
  SYNC_RETRY,
} = syncMachineConstants;

const ModelSync = typesMST
  .model({})
  .volatile(() => {
    const actor = createActor(syncMachine);

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
      get error() {
        return self.state.context.error;
      },
    };
  })
  .views((self) => {
    return {
      get isLoading() {
        return self.isSyncInProgress || self.isSyncRetry;
      },

      get isReady() {
        return self.isSyncError || self.isSynced;
      },
    };
  })
  .actions((self) => {
    const resolveSelfSetter = resolveSetter(self);
    const setSyncState = resolveSelfSetter<'state'>('state');

    const setSyncInProgress = () => {
      self.actor.send({ type: EVENT_START_SYNC });
    };

    const setSynced = () => {
      self.actor.send({ type: EVENT_SYNC_SUCCESS });
    };

    const setSyncError = (error?: unknown) => {
      self.actor.send({ type: EVENT_SYNC_ERROR, error });
    };

    const setSyncRetry = () => {
      self.actor.send({ type: EVENT_SYNC_RETRY });
    };

    return {
      setSynced,
      setSyncInProgress,
      setSyncError,
      setSyncRetry,

      afterCreate() {
        self.actor.subscribe(setSyncState);
        self.actor.start();
      },

      beforeDestroy() {
        self.actor.stop();
      },
    };
  });

export type TInstanceSync = TInstanceModel<typeof ModelSync>;

export default ModelSync;
