/// <reference types="jest" />
import { createActor } from 'xstate';

import { constants, syncAutoMachine } from '..';

const {
  EVENT_CHANGE,
  EVENT_SAVE,
  EVENT_SAVE_ERROR,
  EVENT_SAVE_SUCCESS,
  EVENT_SYNC_SUCCESS,
  EVENT_SYNC_ERROR,
  EVENT_START_SYNC,
  EVENT_CANCEL,
  EVENT_SYNC_RETRY,
  NOT_SAVED,
  SYNC_RETRY,
  NOT_SYNCED,
  SAVE_ERROR,
  SAVE_IN_PROGRESS,
  SYNCED,
  SYNC_ERROR,
  SYNC_IN_PROGRESS,
} = constants;

describe('syncAutoMachine', () => {
  let syncActor: ReturnType<typeof createActor<typeof syncAutoMachine>>;

  describe('syncActor: варианты изменения состояния после инициализации', () => {
    beforeEach(() => {
      syncActor = createActor(syncAutoMachine);
      syncActor.start();
    });

    it('при инициализации ожидается состояние NOT_SYNCED', () => {
      expect(syncActor.getSnapshot().value).toBe(NOT_SYNCED);
    });

    it('не переходит в состояние SYNCED до EVENT_START_SYNC', () => {
      syncActor.send({ type: EVENT_SYNC_SUCCESS });

      expect(syncActor.getSnapshot().matches(NOT_SYNCED)).toBe(true);
      expect(syncActor.getSnapshot().matches(SYNCED)).toBe(false);
    });

    it('не переходит в состояние SYNC_ERROR до EVENT_START_SYNC', () => {
      syncActor.send({ type: EVENT_SYNC_ERROR });

      expect(syncActor.getSnapshot().matches(NOT_SYNCED)).toBe(true);
      expect(syncActor.getSnapshot().matches(SYNC_ERROR)).toBe(false);
    });

    it('не переходит в состояние NOT_SAVED до EVENT_START_SYNC', () => {
      syncActor.send({ type: EVENT_CHANGE });

      expect(syncActor.getSnapshot().matches(NOT_SYNCED)).toBe(true);
      expect(syncActor.getSnapshot().matches(NOT_SAVED)).toBe(false);
    });

    it('не переходит в состояние SAVE_IN_PROGRESS до EVENT_START_SYNC', () => {
      syncActor.send({ type: EVENT_SAVE });

      expect(syncActor.getSnapshot().matches(NOT_SYNCED)).toBe(true);
      expect(syncActor.getSnapshot().matches(SAVE_IN_PROGRESS)).toBe(false);
    });

    it('не переходит в состояние SYNCED directly до EVENT_START_SYNC', () => {
      syncActor.send({ type: EVENT_SAVE_SUCCESS });

      expect(syncActor.getSnapshot().matches(NOT_SYNCED)).toBe(true);
      expect(syncActor.getSnapshot().matches(SYNCED)).toBe(false);
    });

    it('не переходит в состояние SAVE_ERROR до EVENT_START_SYNC', () => {
      syncActor.send({ type: EVENT_SAVE_ERROR });

      expect(syncActor.getSnapshot().matches(NOT_SYNCED)).toBe(true);
      expect(syncActor.getSnapshot().matches(SAVE_ERROR)).toBe(false);
    });

    it('должен осуществляться переход из NOT_SYNCED в SYNC_IN_PROGRESS', () => {
      syncActor.send({ type: EVENT_START_SYNC });

      expect(syncActor.getSnapshot().value).toBe(SYNC_IN_PROGRESS);
    });
  });

  describe('syncActor: переходы из состояния SYNC_IN_PROGRESS', () => {
    beforeEach(() => {
      syncActor = createActor(syncAutoMachine);
      syncActor.start();
      syncActor.send({ type: EVENT_START_SYNC });
    });

    it('при инициализации ожидается SYNC_IN_PROGRESS', () => {
      expect(syncActor.getSnapshot().value).toBe(SYNC_IN_PROGRESS);
    });

    it('не переходит в состояние NOT_SAVED до EVENT_SYNC_SUCCESS', () => {
      syncActor.send({ type: EVENT_CHANGE });

      expect(syncActor.getSnapshot().matches(SYNC_IN_PROGRESS)).toBe(true);
      expect(syncActor.getSnapshot().matches(NOT_SAVED)).toBe(false);
    });

    it('не переходит в состояние SAVE_IN_PROGRESS до EVENT_SYNC_SUCCESS', () => {
      syncActor.send({ type: EVENT_SAVE });

      expect(syncActor.getSnapshot().matches(SYNC_IN_PROGRESS)).toBe(true);
      expect(syncActor.getSnapshot().matches(SAVE_IN_PROGRESS)).toBe(false);
    });

    it('не переходит в состояние SYNCED до EVENT_SYNC_SUCCESS', () => {
      syncActor.send({ type: EVENT_SAVE_SUCCESS });

      expect(syncActor.getSnapshot().matches(SYNC_IN_PROGRESS)).toBe(true);
      expect(syncActor.getSnapshot().matches(SYNCED)).toBe(false);
    });

    it('не переходит в состояние SAVE_ERROR до EVENT_SYNC_SUCCESS', () => {
      syncActor.send({ type: EVENT_SAVE_ERROR });

      expect(syncActor.getSnapshot().matches(SYNC_IN_PROGRESS)).toBe(true);
      expect(syncActor.getSnapshot().matches(SAVE_ERROR)).toBe(false);
    });

    it('должен осуществляться переход из SYNC_IN_PROGRESS в SYNCED', () => {
      syncActor.send({ type: EVENT_SYNC_SUCCESS });

      expect(syncActor.getSnapshot().value).toBe(SYNCED);
    });

    it('должен осуществляться переход из SYNC_IN_PROGRESS в SYNC_ERROR', () => {
      syncActor.send({ type: EVENT_SYNC_ERROR });

      expect(syncActor.getSnapshot().value).toBe(SYNC_ERROR);
    });
  });

  describe('syncActor: переходы из состояния SYNCED', () => {
    beforeEach(() => {
      syncActor = createActor(syncAutoMachine);
      syncActor.start();
      syncActor.send({ type: EVENT_START_SYNC });
      syncActor.send({ type: EVENT_SYNC_SUCCESS });
    });

    it('при инициализации ожидается SYNCED', () => {
      expect(syncActor.getSnapshot().value).toBe(SYNCED);
    });

    it('не переходит в состояние SAVE_IN_PROGRESS', () => {
      syncActor.send({ type: EVENT_SAVE });

      expect(syncActor.getSnapshot().matches(SYNCED)).toBe(true);
      expect(syncActor.getSnapshot().matches(SAVE_IN_PROGRESS)).toBe(false);
    });

    it('не переходит в состояние SAVE_ERROR', () => {
      syncActor.send({ type: EVENT_SAVE_ERROR });

      expect(syncActor.getSnapshot().matches(SYNCED)).toBe(true);
      expect(syncActor.getSnapshot().matches(SAVE_ERROR)).toBe(false);
    });

    it('не переходит в состояние SYNC_ERROR', () => {
      syncActor.send({ type: EVENT_SYNC_ERROR });

      expect(syncActor.getSnapshot().matches(SYNCED)).toBe(true);
      expect(syncActor.getSnapshot().matches(SYNC_ERROR)).toBe(false);
    });

    it('не переходит в состояние SYNC_IN_PROGRESS', () => {
      syncActor.send({ type: EVENT_START_SYNC });

      expect(syncActor.getSnapshot().matches(SYNCED)).toBe(true);
      expect(syncActor.getSnapshot().matches(SYNC_IN_PROGRESS)).toBe(false);
    });

    it('должен осуществляться переход из SYNCED в NOT_SAVED', () => {
      syncActor.send({ type: EVENT_CHANGE });

      expect(syncActor.getSnapshot().value).toBe(NOT_SAVED);
    });
  });

  describe('syncActor: переходы из состояния SYNC_ERROR', () => {
    beforeEach(() => {
      syncActor = createActor(syncAutoMachine);
      syncActor.start();
      syncActor.send({ type: EVENT_START_SYNC });
      syncActor.send({ type: EVENT_SYNC_ERROR });
    });

    it('при инициализации ожидается SYNC_ERROR', () => {
      expect(syncActor.getSnapshot().value).toBe(SYNC_ERROR);
    });

    it('не переходит в состояние NOT_SAVED', () => {
      syncActor.send({ type: EVENT_CHANGE });

      expect(syncActor.getSnapshot().matches(SYNC_ERROR)).toBe(true);
      expect(syncActor.getSnapshot().matches(NOT_SAVED)).toBe(false);
    });

    it('не переходит в состояние SAVE_IN_PROGRESS', () => {
      syncActor.send({ type: EVENT_SAVE });

      expect(syncActor.getSnapshot().matches(SYNC_ERROR)).toBe(true);
      expect(syncActor.getSnapshot().matches(SAVE_IN_PROGRESS)).toBe(false);
    });

    it('не переходит в состояние SYNCED до SYNC_IN_PROGRESS', () => {
      syncActor.send({ type: EVENT_SAVE_SUCCESS });

      expect(syncActor.getSnapshot().matches(SYNC_ERROR)).toBe(true);
      expect(syncActor.getSnapshot().matches(SYNCED)).toBe(false);
    });

    it('не переходит в состояние SAVE_ERROR', () => {
      syncActor.send({ type: EVENT_SAVE_ERROR });

      expect(syncActor.getSnapshot().matches(SYNC_ERROR)).toBe(true);
      expect(syncActor.getSnapshot().matches(SAVE_ERROR)).toBe(false);
    });

    it('не переходит в состояние SYNCED', () => {
      syncActor.send({ type: EVENT_SYNC_SUCCESS });

      expect(syncActor.getSnapshot().matches(SYNC_ERROR)).toBe(true);
      expect(syncActor.getSnapshot().matches(SYNCED)).toBe(false);
    });
  });

  describe('syncActor: переходы из состояния SYNC_RETRY', () => {
    beforeEach(() => {
      syncActor = createActor(syncAutoMachine);
      syncActor.start();
      syncActor.send({ type: EVENT_START_SYNC });
      syncActor.send({ type: EVENT_SYNC_RETRY });
    });

    it('при инициализации ожидается SYNC_RETRY', () => {
      expect(syncActor.getSnapshot().value).toBe(SYNC_RETRY);
    });

    it('не переходит в состояние NOT_SAVED', () => {
      syncActor.send({ type: EVENT_CHANGE });

      expect(syncActor.getSnapshot().matches(SYNC_RETRY)).toBe(true);
      expect(syncActor.getSnapshot().matches(NOT_SAVED)).toBe(false);
    });

    it('не переходит в состояние SAVE_IN_PROGRESS', () => {
      syncActor.send({ type: EVENT_SAVE });

      expect(syncActor.getSnapshot().matches(SYNC_RETRY)).toBe(true);
      expect(syncActor.getSnapshot().matches(SAVE_IN_PROGRESS)).toBe(false);
    });

    it('не переходит в состояние SYNCED до SYNC_IN_PROGRESS', () => {
      syncActor.send({ type: EVENT_SAVE_SUCCESS });

      expect(syncActor.getSnapshot().matches(SYNC_RETRY)).toBe(true);
      expect(syncActor.getSnapshot().matches(SYNCED)).toBe(false);
    });

    it('не переходит в состояние SAVE_ERROR', () => {
      syncActor.send({ type: EVENT_SAVE_ERROR });

      expect(syncActor.getSnapshot().matches(SYNC_RETRY)).toBe(true);
      expect(syncActor.getSnapshot().matches(SAVE_ERROR)).toBe(false);
    });

    it('не переходит в состояние SYNCED', () => {
      syncActor.send({ type: EVENT_SYNC_SUCCESS });

      expect(syncActor.getSnapshot().matches(SYNC_RETRY)).toBe(false);
      expect(syncActor.getSnapshot().matches(SYNCED)).toBe(true);
    });

    it('не переходит в состояние SYNC_IN_PROGRESS', () => {
      syncActor.send({ type: EVENT_START_SYNC });

      expect(syncActor.getSnapshot().matches(SYNC_RETRY)).toBe(true);
      expect(syncActor.getSnapshot().matches(SYNC_IN_PROGRESS)).toBe(false);
    });
  });

  describe('syncActor: переходы из состояния NOT_SAVED', () => {
    beforeEach(() => {
      syncActor = createActor(syncAutoMachine);
      syncActor.start();
      syncActor.send({ type: EVENT_START_SYNC });
      syncActor.send({ type: EVENT_SYNC_SUCCESS });
      syncActor.send({ type: EVENT_CHANGE });
    });

    it('при инициализации ожидается NOT_SAVED', () => {
      expect(syncActor.getSnapshot().value).toBe(NOT_SAVED);
    });

    it('не переходит в состояние SYNC_IN_PROGRESS', () => {
      syncActor.send({ type: EVENT_START_SYNC });

      expect(syncActor.getSnapshot().matches(NOT_SAVED)).toBe(true);
      expect(syncActor.getSnapshot().matches(SYNC_IN_PROGRESS)).toBe(false);
    });

    it('не переходит в состояние SYNC_ERROR', () => {
      syncActor.send({ type: EVENT_SYNC_ERROR });

      expect(syncActor.getSnapshot().matches(NOT_SAVED)).toBe(true);
      expect(syncActor.getSnapshot().matches(SYNC_ERROR)).toBe(false);
    });

    it('не переходит в состояние SYNCED до SAVE_IN_PROGRESS', () => {
      syncActor.send({ type: EVENT_SAVE_SUCCESS });

      expect(syncActor.getSnapshot().matches(NOT_SAVED)).toBe(true);
      expect(syncActor.getSnapshot().matches(SYNCED)).toBe(false);
    });

    it('не переходит в состояние SAVE_ERROR до SAVE_IN_PROGRESS', () => {
      syncActor.send({ type: EVENT_SAVE_ERROR });

      expect(syncActor.getSnapshot().matches(NOT_SAVED)).toBe(true);
      expect(syncActor.getSnapshot().matches(SAVE_ERROR)).toBe(false);
    });

    it('должен осуществляться переход из NOT_SAVED в SYNCED', () => {
      syncActor.send({ type: EVENT_CANCEL });

      expect(syncActor.getSnapshot().matches(SYNCED)).toBe(true);
    });

    it('должен осуществляться переход из NOT_SAVED в SAVE_IN_PROGRESS', () => {
      syncActor.send({ type: EVENT_SAVE });

      expect(syncActor.getSnapshot().value).toBe(SAVE_IN_PROGRESS);
    });
  });

  describe('syncActor: переходы из состояния SAVE_IN_PROGRESS', () => {
    beforeEach(() => {
      syncActor = createActor(syncAutoMachine);
      syncActor.start();
      syncActor.send({ type: EVENT_START_SYNC });
      syncActor.send({ type: EVENT_SYNC_SUCCESS });
      syncActor.send({ type: EVENT_CHANGE });
      syncActor.send({ type: EVENT_SAVE });
    });

    it('при инициализации ожидается SAVE_IN_PROGRESS', () => {
      expect(syncActor.getSnapshot().value).toBe(SAVE_IN_PROGRESS);
    });

    it('не переходит в состояние SYNC_IN_PROGRESS', () => {
      syncActor.send({ type: EVENT_START_SYNC });

      expect(syncActor.getSnapshot().matches(SAVE_IN_PROGRESS)).toBe(true);
      expect(syncActor.getSnapshot().matches(SYNC_IN_PROGRESS)).toBe(false);
    });

    it('не переходит в состояние SYNCED до EVENT_SAVE_SUCCESS', () => {
      syncActor.send({ type: EVENT_SYNC_SUCCESS });

      expect(syncActor.getSnapshot().matches(SAVE_IN_PROGRESS)).toBe(true);
      expect(syncActor.getSnapshot().matches(SYNCED)).toBe(false);
    });

    it('не переходит в состояние SYNC_ERROR', () => {
      syncActor.send({ type: EVENT_SYNC_ERROR });

      expect(syncActor.getSnapshot().matches(SAVE_IN_PROGRESS)).toBe(true);
      expect(syncActor.getSnapshot().matches(SYNC_ERROR)).toBe(false);
    });

    it('не переходит в состояние NOT_SAVED', () => {
      syncActor.send({ type: EVENT_CHANGE });

      expect(syncActor.getSnapshot().matches(SAVE_IN_PROGRESS)).toBe(true);
      expect(syncActor.getSnapshot().matches(NOT_SAVED)).toBe(false);
    });

    it('должен осуществляться переход из SAVE_IN_PROGRESS в SYNCED', () => {
      syncActor.send({ type: EVENT_SAVE_SUCCESS });

      expect(syncActor.getSnapshot().value).toBe(SYNCED);
    });

    it('должен осуществляться переход из SAVE_IN_PROGRESS в SAVE_ERROR', () => {
      syncActor.send({ type: EVENT_SAVE_ERROR });

      expect(syncActor.getSnapshot().value).toBe(SAVE_ERROR);
    });
  });

  describe('syncActor: переходы из состояния SAVE_ERROR', () => {
    beforeEach(() => {
      syncActor = createActor(syncAutoMachine);
      syncActor.start();
      syncActor.send({ type: EVENT_START_SYNC });
      syncActor.send({ type: EVENT_SYNC_SUCCESS });
      syncActor.send({ type: EVENT_CHANGE });
      syncActor.send({ type: EVENT_SAVE });
      syncActor.send({ type: EVENT_SAVE_ERROR });
    });

    it('при инициализации ожидается SAVE_ERROR', () => {
      expect(syncActor.getSnapshot().value).toBe(SAVE_ERROR);
    });

    it('не переходит в состояние SYNC_IN_PROGRESS', () => {
      syncActor.send({ type: EVENT_START_SYNC });

      expect(syncActor.getSnapshot().matches(SAVE_ERROR)).toBe(true);
      expect(syncActor.getSnapshot().matches(SYNC_IN_PROGRESS)).toBe(false);
    });

    it('не переходит в состояние SYNC_ERROR', () => {
      syncActor.send({ type: EVENT_SYNC_ERROR });

      expect(syncActor.getSnapshot().matches(SAVE_ERROR)).toBe(true);
      expect(syncActor.getSnapshot().matches(SYNC_ERROR)).toBe(false);
    });

    it('не переходит в состояние SYNCED до SAVE_IN_PROGRESS', () => {
      syncActor.send({ type: EVENT_SAVE_SUCCESS });

      expect(syncActor.getSnapshot().matches(SAVE_ERROR)).toBe(true);
      expect(syncActor.getSnapshot().matches(SYNCED)).toBe(false);
    });

    it('переход в состояние SAVE_IN_PROGRESS', () => {
      syncActor.send({ type: EVENT_SAVE });

      expect(syncActor.getSnapshot().value).toBe(SAVE_IN_PROGRESS);
    });

    it('переход в состояние NOT_SAVED', () => {
      syncActor.send({ type: EVENT_CHANGE });

      expect(syncActor.getSnapshot().value).toBe(NOT_SAVED);
    });

    it('переход в состояние SYNCED', () => {
      syncActor.send({ type: EVENT_CANCEL });

      expect(syncActor.getSnapshot().value).toBe(SYNCED);
    });
  });

  describe('syncActor: обработка ошибок и контекст', () => {
    beforeEach(() => {
      syncActor = createActor(syncAutoMachine);
      syncActor.start();
    });

    it('должен сохранять ошибку в контексте при EVENT_SYNC_ERROR', () => {
      const testError = new Error('Test sync error');

      syncActor.send({ type: EVENT_START_SYNC });
      syncActor.send({ type: EVENT_SYNC_ERROR, error: testError });

      expect(syncActor.getSnapshot().context.error).toBe(testError);
    });

    it('должен сохранять ошибку в контексте при EVENT_SAVE_ERROR', () => {
      const testError = new Error('Test save error');

      syncActor.send({ type: EVENT_START_SYNC });
      syncActor.send({ type: EVENT_SYNC_SUCCESS });
      syncActor.send({ type: EVENT_CHANGE });
      syncActor.send({ type: EVENT_SAVE });
      syncActor.send({ type: EVENT_SAVE_ERROR, error: testError });

      expect(syncActor.getSnapshot().context.error).toBe(testError);
    });

    it('должен иметь undefined error в начальном состоянии', () => {
      expect(syncActor.getSnapshot().context.error).toBeUndefined();
    });
  });

  describe('syncActor: финальные состояния', () => {
    beforeEach(() => {
      syncActor = createActor(syncAutoMachine);
      syncActor.start();
    });

    it('SYNC_ERROR должно быть финальным состоянием', () => {
      syncActor.send({ type: EVENT_START_SYNC });
      syncActor.send({ type: EVENT_SYNC_ERROR });

      expect(syncActor.getSnapshot().status).toBe('done');
    });

    it('должен сохранять ошибку в контексте при переходе в SYNC_ERROR из SYNC_RETRY', () => {
      const testError = new Error('Test retry error');

      syncActor.send({ type: EVENT_START_SYNC });
      syncActor.send({ type: EVENT_SYNC_RETRY });
      syncActor.send({ type: EVENT_SYNC_ERROR, error: testError });

      expect(syncActor.getSnapshot().context.error).toBe(testError);
      expect(syncActor.getSnapshot().value).toBe(SYNC_ERROR);
    });
  });
});
