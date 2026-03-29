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
} from '../stateMachine';

describe('chatStateMachine', () => {
  let chatActor: ReturnType<typeof createActor<typeof stateMachine>>;

  beforeEach(() => {
    chatActor = createActor(stateMachine);
    chatActor.start();
  });

  it('должно изначально находиться в состоянии NOT_SYNCED', () => {
    expect(chatActor.getSnapshot().value).toBe(NOT_SYNCED);
  });

  describe('переходы из NOT_SYNCED', () => {
    it('должно переходить в SYNC_IN_PROGRESS при EVENT_SYNC_IN_PROGRESS', () => {
      chatActor.send({ type: EVENT_SYNC_IN_PROGRESS });

      expect(chatActor.getSnapshot().value).toBe(SYNC_IN_PROGRESS);
    });

    it('не должно переходить в другие состояния', () => {
      chatActor.send({ type: EVENT_AVAILABLE });

      expect(chatActor.getSnapshot().value).toBe(NOT_SYNCED);

      chatActor.send({ type: EVENT_NOT_AVAILABLE });

      expect(chatActor.getSnapshot().value).toBe(NOT_SYNCED);

      chatActor.send({ type: EVENT_ACTIVE });

      expect(chatActor.getSnapshot().value).toBe(NOT_SYNCED);

      chatActor.send({ type: EVENT_BANNED });

      expect(chatActor.getSnapshot().value).toBe(NOT_SYNCED);
    });
  });

  describe('переходы из SYNC_IN_PROGRESS', () => {
    beforeEach(() => {
      chatActor.send({ type: EVENT_SYNC_IN_PROGRESS });
    });

    it('должно переходить в NOT_SYNCED при EVENT_NOT_SYNCED', () => {
      chatActor.send({ type: EVENT_NOT_SYNCED });

      expect(chatActor.getSnapshot().value).toBe(NOT_SYNCED);
    });

    it('должно переходить в NOT_AVAILABLE при EVENT_NOT_AVAILABLE', () => {
      chatActor.send({ type: EVENT_NOT_AVAILABLE });

      expect(chatActor.getSnapshot().value).toBe(NOT_AVAILABLE);
    });

    it('должно переходить в AVAILABLE при EVENT_AVAILABLE', () => {
      chatActor.send({ type: EVENT_AVAILABLE });

      expect(chatActor.getSnapshot().value).toBe(AVAILABLE);
    });

    it('не должно переходить в другие состояния', () => {
      chatActor.send({ type: EVENT_ACTIVE });

      expect(chatActor.getSnapshot().value).toBe(SYNC_IN_PROGRESS);

      chatActor.send({ type: EVENT_BANNED });

      expect(chatActor.getSnapshot().value).toBe(SYNC_IN_PROGRESS);
    });
  });

  describe('переходы из ACTIVE', () => {
    beforeEach(() => {
      chatActor.send({ type: EVENT_SYNC_IN_PROGRESS });
      chatActor.send({ type: EVENT_AVAILABLE });
      chatActor.send({ type: EVENT_ACTIVE });
    });

    it('должно переходить в BANNED при EVENT_BANNED', () => {
      chatActor.send({ type: EVENT_BANNED });

      expect(chatActor.getSnapshot().value).toBe(BANNED);
    });

    it('должно переходить в NOT_SYNCED при EVENT_NOT_SYNCED', () => {
      chatActor.send({ type: EVENT_NOT_SYNCED });

      expect(chatActor.getSnapshot().value).toBe(NOT_SYNCED);
    });

    it('должно переходить в NOT_AVAILABLE при EVENT_NOT_AVAILABLE', () => {
      chatActor.send({ type: EVENT_NOT_AVAILABLE });

      expect(chatActor.getSnapshot().value).toBe(NOT_AVAILABLE);
    });

    it('не должно переходить в другие состояния', () => {
      chatActor.send({ type: EVENT_SYNC_IN_PROGRESS });

      expect(chatActor.getSnapshot().value).toBe(ACTIVE);

      chatActor.send({ type: EVENT_AVAILABLE });

      expect(chatActor.getSnapshot().value).toBe(ACTIVE);
    });
  });

  describe('переходы из AVAILABLE', () => {
    beforeEach(() => {
      chatActor.send({ type: EVENT_SYNC_IN_PROGRESS });
      chatActor.send({ type: EVENT_AVAILABLE });
    });

    it('должно переходить в ACTIVE при EVENT_ACTIVE', () => {
      chatActor.send({ type: EVENT_ACTIVE });

      expect(chatActor.getSnapshot().value).toBe(ACTIVE);
    });

    it('должно переходить в NOT_AVAILABLE при EVENT_NOT_AVAILABLE', () => {
      chatActor.send({ type: EVENT_NOT_AVAILABLE });

      expect(chatActor.getSnapshot().value).toBe(NOT_AVAILABLE);
    });

    it('должно переходить в NOT_SYNCED при EVENT_NOT_SYNCED', () => {
      chatActor.send({ type: EVENT_NOT_SYNCED });

      expect(chatActor.getSnapshot().value).toBe(NOT_SYNCED);
    });

    it('не должно переходить в другие состояния', () => {
      chatActor.send({ type: EVENT_SYNC_IN_PROGRESS });

      expect(chatActor.getSnapshot().value).toBe(AVAILABLE);

      chatActor.send({ type: EVENT_BANNED });

      expect(chatActor.getSnapshot().value).toBe(AVAILABLE);
    });
  });

  describe('переходы из NOT_AVAILABLE', () => {
    beforeEach(() => {
      chatActor.send({ type: EVENT_SYNC_IN_PROGRESS });
      chatActor.send({ type: EVENT_NOT_AVAILABLE });
    });

    it('должно переходить в NOT_SYNCED при EVENT_NOT_SYNCED', () => {
      chatActor.send({ type: EVENT_NOT_SYNCED });

      expect(chatActor.getSnapshot().value).toBe(NOT_SYNCED);
    });

    it('должно переходить в AVAILABLE при EVENT_AVAILABLE', () => {
      chatActor.send({ type: EVENT_AVAILABLE });

      expect(chatActor.getSnapshot().value).toBe(AVAILABLE);
    });

    it('не должно переходить в другие состояния', () => {
      chatActor.send({ type: EVENT_SYNC_IN_PROGRESS });

      expect(chatActor.getSnapshot().value).toBe(NOT_AVAILABLE);

      chatActor.send({ type: EVENT_ACTIVE });

      expect(chatActor.getSnapshot().value).toBe(NOT_AVAILABLE);

      chatActor.send({ type: EVENT_BANNED });

      expect(chatActor.getSnapshot().value).toBe(NOT_AVAILABLE);
    });
  });

  describe('переходы из BANNED', () => {
    beforeEach(() => {
      chatActor.send({ type: EVENT_SYNC_IN_PROGRESS });
      chatActor.send({ type: EVENT_AVAILABLE });
      chatActor.send({ type: EVENT_ACTIVE });
      chatActor.send({ type: EVENT_BANNED });
    });

    it('должно переходить в ACTIVE при EVENT_ACTIVE', () => {
      chatActor.send({ type: EVENT_ACTIVE });

      expect(chatActor.getSnapshot().value).toBe(ACTIVE);
    });

    it('должно переходить в NOT_SYNCED при EVENT_NOT_SYNCED', () => {
      chatActor.send({ type: EVENT_NOT_SYNCED });

      expect(chatActor.getSnapshot().value).toBe(NOT_SYNCED);
    });

    it('должно переходить в NOT_AVAILABLE при EVENT_NOT_AVAILABLE', () => {
      chatActor.send({ type: EVENT_NOT_AVAILABLE });

      expect(chatActor.getSnapshot().value).toBe(NOT_AVAILABLE);
    });

    it('не должно переходить в другие состояния', () => {
      chatActor.send({ type: EVENT_SYNC_IN_PROGRESS });

      expect(chatActor.getSnapshot().value).toBe(BANNED);

      chatActor.send({ type: EVENT_AVAILABLE });

      expect(chatActor.getSnapshot().value).toBe(BANNED);
    });
  });
});
