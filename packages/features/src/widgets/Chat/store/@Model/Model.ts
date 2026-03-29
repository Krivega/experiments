import { resolveSetter } from '@experiments/mst-tools';
import { types as typesMST } from 'mobx-state-tree';
import { createActor } from 'xstate';

import stateMachine, {
  ACTIVE,
  AVAILABLE,
  BANNED,
  EVENT_ACTIVE,
  EVENT_AVAILABLE,
  EVENT_BANNED,
  EVENT_NOT_AVAILABLE,
  EVENT_NOT_SYNCED,
  EVENT_SYNC_IN_PROGRESS,
  NOT_AVAILABLE,
  NOT_SYNCED,
  SYNC_IN_PROGRESS,
} from './stateMachine';

import type { TInstanceModel } from '@experiments/mst-tools';

const Model = typesMST
  .model({
    isModerator: typesMST.boolean,
  })
  .volatile(() => {
    const actor = createActor(stateMachine);

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

      get isBanned() {
        return self.state.value === BANNED;
      },

      get isAvailable() {
        return self.state.value === AVAILABLE;
      },

      get isActive() {
        return self.state.value === ACTIVE;
      },

      get isNotAvailable() {
        return self.state.value === NOT_AVAILABLE;
      },
    };
  })
  .views((self) => {
    return {
      get isActivated() {
        return self.isActive || self.isBanned;
      },
    };
  })
  .actions((self) => {
    const resolveSelfSetter = resolveSetter(self);
    const setState = resolveSelfSetter<'state'>('state');
    const setIsModerator = resolveSelfSetter('isModerator');

    const setNotSynced = () => {
      self.actor.send({ type: EVENT_NOT_SYNCED });
    };

    const setSyncInProgress = () => {
      self.actor.send({ type: EVENT_SYNC_IN_PROGRESS });
    };

    const setNotAvailable = () => {
      self.actor.send({ type: EVENT_NOT_AVAILABLE });
    };

    const setAvailable = () => {
      self.actor.send({ type: EVENT_AVAILABLE });
    };

    const setActive = () => {
      self.actor.send({ type: EVENT_ACTIVE });
    };

    const setBanned = () => {
      self.actor.send({ type: EVENT_BANNED });
    };

    const afterCreate = () => {
      self.actor.subscribe(setState);
      self.actor.start();
    };

    const beforeDestroy = () => {
      self.actor.stop();
    };

    return {
      setIsModerator,
      setNotSynced,
      setSyncInProgress,
      setNotAvailable,
      setAvailable,
      setActive,
      setBanned,

      afterCreate,
      beforeDestroy,
    };
  });

export type TInstance = TInstanceModel<typeof Model>;

export default Model;
