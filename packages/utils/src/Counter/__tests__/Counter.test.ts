/// <reference types="jest" />
import Counter from '..';

describe('Counter', () => {
  it('инициализируется с заданными значениями', () => {
    const counter = new Counter({ initial: 2, limit: 5 });

    expect(counter.count).toBe(2);
    expect(counter.hasLimitReached()).toBe(false);
  });

  it('увеличивает значение count при вызове increment', () => {
    const counter = new Counter({ initial: 0, limit: 3 });

    counter.increment();

    expect(counter.count).toBe(1);

    counter.increment();

    expect(counter.count).toBe(2);
  });

  it('бросает ошибку при достижении лимита', () => {
    const counter = new Counter({ initial: 0, limit: 2 });

    counter.increment();
    counter.increment();

    expect(() => {
      counter.increment();
    }).toThrow();
  });

  it('сбрасывает значение count до initial при reset', () => {
    const counter = new Counter({ initial: 1, limit: 5 });

    counter.increment();
    counter.reset();

    expect(counter.count).toBe(1);
  });

  it('возвращает true, если лимит достигнут', () => {
    const counter = new Counter({ initial: 3, limit: 3 });

    expect(counter.hasLimitReached()).toBe(true);
  });

  it('возвращает false, если лимит не достигнут', () => {
    const counter = new Counter({ initial: 1, limit: 3 });

    expect(counter.hasLimitReached()).toBe(false);
  });
});
