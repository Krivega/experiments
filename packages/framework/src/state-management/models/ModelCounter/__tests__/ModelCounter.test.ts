/// <reference types="jest" />
import { ModelCounter, type TCounterStore } from '../index';

describe('ModelCounter', () => {
  let counterStore: TCounterStore;

  beforeEach(() => {
    counterStore = ModelCounter.create({
      count: 0,
      initialCount: 0,
      limit: 10,
    });
  });

  it('initial state', () => {
    expect(counterStore.count).toBe(0);
    expect(counterStore.initialCount).toBe(0);
    expect(counterStore.limit).toBe(10);
    expect(counterStore.hasLimitReached()).toBe(false);
  });

  it('increment', () => {
    counterStore.increment();

    expect(counterStore.count).toBe(1);
    expect(counterStore.hasLimitReached()).toBe(false);
  });

  it('reset', () => {
    counterStore.increment();

    counterStore.reset();

    expect(counterStore.count).toBe(0);
    expect(counterStore.hasLimitReached()).toBe(false);
  });

  it('hasLimitReached', () => {
    counterStore.increment();
    counterStore.increment();
    counterStore.increment();
    counterStore.increment();
    counterStore.increment();
    counterStore.increment();
    counterStore.increment();
    counterStore.increment();
    counterStore.increment();
    counterStore.increment();

    expect(counterStore.count).toBe(10);
    expect(counterStore.hasLimitReached()).toBe(true);
  });

  it('should not increment when limit is reached', () => {
    // Достигаем лимита
    for (let i = 0; i < 10; i++) {
      counterStore.increment();
    }

    expect(counterStore.count).toBe(10);
    expect(counterStore.hasLimitReached()).toBe(true);

    // Пытаемся увеличить еще раз - должно остаться 10
    counterStore.increment();

    expect(counterStore.count).toBe(10);
    expect(counterStore.hasLimitReached()).toBe(true);
  });
});
