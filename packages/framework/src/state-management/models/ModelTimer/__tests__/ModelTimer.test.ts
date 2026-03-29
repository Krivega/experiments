/// <reference types="jest" />
import { destroy } from 'mobx-state-tree';

import ModelTimer from '../ModelTimer';

import type { TTimerStore } from '../ModelTimer';

describe('ModelTimer', () => {
  let instance: TTimerStore;
  let now: number;
  let clearTimeoutSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();

    instance = ModelTimer.create();

    now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('должен обновлять timestamp каждую секунду', async () => {
    expect(instance.timestamp).toBe(0);
    expect(instance.startedAt).toBe(0);

    instance.startTimer();

    expect(instance.timestamp).toBe(now);
    expect(instance.startedAt).toBe(now);

    jest.advanceTimersByTime(1000);

    expect(instance.timestamp).toBe(now);

    instance.stopTimer();

    expect(instance.startedAt).toBe(0);
  });

  it('должен устанавливать одинаковые timestamp и startedAt при старте', () => {
    expect(instance.timestamp).toBe(0);
    expect(instance.startedAt).toBe(0);

    instance.startTimer();

    expect(instance.timestamp).toBe(now);
    expect(instance.startedAt).toBe(now);
    expect(instance.timestamp).toBe(instance.startedAt);
  });

  it('должен останавливать таймер', async () => {
    const stopTimerSpy = jest.spyOn(instance, 'stopTimer');

    instance.startTimer();

    expect(instance.timestamp).toBe(now);
    expect(instance.startedAt).toBe(now);

    instance.stopTimer();

    expect(stopTimerSpy).toHaveBeenCalled();
    expect(instance.startedAt).toBe(0);

    jest.advanceTimersByTime(1000);

    expect(instance.timestamp).toBe(now); // Timestamp не изменился после остановки
  });

  it('не должен перезапускать таймер, если он уже запущен', async () => {
    instance.startTimer();

    expect(instance.timestamp).toBe(now);
    expect(instance.startedAt).toBe(now);
    expect(jest.getTimerCount()).toBe(1);

    instance.startTimer();

    expect(jest.getTimerCount()).toBe(1);
    expect(instance.timestamp).toBe(now);
  });

  it('должен останавливать таймер при destroy модели', () => {
    instance.startTimer();

    expect(instance.timestamp).toBe(now);
    expect(jest.getTimerCount()).toBe(1); // Проверяем, что таймер запущен

    const timestampBeforeDestroy = instance.timestamp;

    destroy(instance);

    // Проверяем, что таймер был остановлен в beforeDestroy
    expect(jest.getTimerCount()).toBe(0);

    jest.advanceTimersByTime(1000);
    // Таймер остановлен, поэтому timestamp не должен был измениться до уничтожения
    expect(timestampBeforeDestroy).toBe(now);
  });

  it('должен устанавливать timestamp заданным значением', () => {
    const timestamp = 12_345;

    instance.setTimestamp(timestamp);

    expect(instance.timestamp).toBe(timestamp);
  });

  it('должен вызывать clearTimeout при остановке таймера', () => {
    instance.startTimer();
    instance.stopTimer();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('должен обрабатывать stopTimer без ошибки, когда таймер не запущен', () => {
    expect(() => {
      instance.stopTimer();
    }).not.toThrow();

    expect(clearTimeoutSpy).not.toHaveBeenCalled();
    expect(instance.startedAt).toBe(0);
  });

  it('должен устанавливать startedAt и сбрасывать его в stopTimer', () => {
    expect(instance.startedAt).toBe(0);

    instance.startTimer();

    expect(instance.startedAt).toBe(now);

    instance.stopTimer();

    expect(instance.startedAt).toBe(0);
  });

  it('должен вычислять elapsedMs по startedAt и timestamp', () => {
    const nowElapsed = 100_000;
    const elapsedMsInTest = 2500;

    jest.spyOn(Date, 'now').mockReturnValue(nowElapsed);

    expect(instance.elapsedMs).toBe(0);

    instance.startTimer();

    expect(instance.elapsedMs).toBe(0);

    jest.spyOn(Date, 'now').mockReturnValue(nowElapsed + elapsedMsInTest);
    instance.setTimestamp(nowElapsed + elapsedMsInTest);

    expect(instance.elapsedMs).toBe(elapsedMsInTest);

    instance.stopTimer();

    expect(instance.elapsedMs).toBe(0);
  });

  describe('isNotStarted', () => {
    it('должен возвращать true до вызова startTimer', () => {
      expect(instance.startedAt).toBe(0);
      expect(instance.isNotStarted).toBe(true);
    });

    it('должен возвращать false после вызова startTimer', () => {
      instance.startTimer();

      expect(instance.isNotStarted).toBe(false);
    });

    it('должен возвращать true после вызова stopTimer', () => {
      instance.startTimer();

      expect(instance.isNotStarted).toBe(false);

      instance.stopTimer();

      expect(instance.isNotStarted).toBe(true);
    });
  });
});
