/// <reference types="jest" />
import { types } from 'mobx-state-tree';

import createQueue from '../createQueue';

describe('createQueue', () => {
  const QueueItem = types.model({ value: types.number });

  it('create queue', () => {
    const Queue = createQueue(QueueItem);
    const queueInstance = Queue.create();

    expect(queueInstance.items).toEqual([]);
    expect(queueInstance.size).toBe(0);
    expect(queueInstance.isEmpty).toBe(true);
    expect(queueInstance.peek).toBeUndefined();
  });

  it('push value', () => {
    const Queue = createQueue(QueueItem);
    const queueInstance = Queue.create();

    queueInstance.push({ value: 1 });

    expect(queueInstance.items).toEqual([{ value: 1 }]);
    expect(queueInstance.size).toBe(1);
    expect(queueInstance.isEmpty).toBe(false);
    expect(queueInstance.peek).toEqual({ value: 1 });
  });

  it('pop value', () => {
    const Queue = createQueue(QueueItem);
    const queueInstance = Queue.create();

    queueInstance.push({ value: 1 });
    queueInstance.push({ value: 2 });

    const value = queueInstance.pop();

    expect(value).toEqual({ value: 1 });
    expect(queueInstance.items).toEqual([{ value: 2 }]);
    expect(queueInstance.size).toBe(1);
    expect(queueInstance.isEmpty).toBe(false);
    expect(queueInstance.peek).toEqual({ value: 2 });
  });

  it('pop: should return undefined when no left elements', () => {
    const Queue = createQueue(QueueItem);
    const queueInstance = Queue.create();

    queueInstance.push({ value: 1 });

    const value = queueInstance.pop();

    expect(value).toEqual({ value: 1 });

    const nextValue = queueInstance.pop();

    expect(nextValue).toEqual(undefined);
  });

  it('pop: should return the element as a new model', () => {
    const Queue = createQueue(QueueItem);
    const queueInstance = Queue.create();

    queueInstance.push({ value: 1 });

    const storedItem = queueInstance.peek;

    const returnedItem = queueInstance.pop();

    expect(returnedItem).not.toBe(storedItem);
    expect(returnedItem).toEqual(storedItem);
    expect(returnedItem).toEqual({ value: 1 });
  });

  it('peek value', () => {
    const Queue = createQueue(QueueItem);
    const queueInstance = Queue.create();

    queueInstance.push({ value: 1 });
    queueInstance.push({ value: 2 });

    const value = queueInstance.peek;

    expect(value).toEqual({ value: 1 });
    expect(queueInstance.items).toEqual([{ value: 1 }, { value: 2 }]);
    expect(queueInstance.size).toBe(2);
    expect(queueInstance.isEmpty).toBe(false);
    expect(queueInstance.peek).toEqual({ value: 1 });
  });

  it('pop empty queue', () => {
    const Queue = createQueue(QueueItem);
    const queueInstance = Queue.create();

    const value = queueInstance.pop();

    expect(value).toBeUndefined();
    expect(queueInstance.items).toEqual([]);
    expect(queueInstance.size).toBe(0);
    expect(queueInstance.isEmpty).toBe(true);
    expect(queueInstance.peek).toBeUndefined();
  });

  it('clear queue', () => {
    const Queue = createQueue(QueueItem);
    const queueInstance = Queue.create();

    queueInstance.push({ value: 1 });
    queueInstance.push({ value: 2 });
    queueInstance.clear();

    expect(queueInstance.items).toEqual([]);
    expect(queueInstance.size).toBe(0);
    expect(queueInstance.isEmpty).toBe(true);
    expect(queueInstance.peek).toBeUndefined();
  });

  it('clear empty queue', () => {
    const Queue = createQueue(QueueItem);
    const queueInstance = Queue.create();

    queueInstance.push({ value: 1 });
    queueInstance.push({ value: 2 });

    queueInstance.clear();

    expect(queueInstance.items).toEqual([]);
    expect(queueInstance.size).toBe(0);
    expect(queueInstance.isEmpty).toBe(true);
    expect(queueInstance.peek).toBeUndefined();
  });
});
