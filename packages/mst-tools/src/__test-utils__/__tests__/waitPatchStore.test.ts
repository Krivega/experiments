/// <reference types="jest" />
import { types } from 'mobx-state-tree';

import { waitPatchStore } from '../index';

import type { Instance } from 'mobx-state-tree';

const Todo = types
  .model('Todo', {
    title: types.string,
    volumeAudio: types.number,
    done: false,
  })
  .actions((self) => {
    return {
      toggle() {
        // eslint-disable-next-line no-param-reassign
        self.done = !self.done;
      },
      setVolumeAudio(volume: number) {
        // eslint-disable-next-line no-param-reassign
        self.volumeAudio = volume;
      },
    };
  });

describe('waitPatchStore', () => {
  let todo: Instance<typeof Todo>;

  beforeEach(() => {
    todo = Todo.create({
      title: 'Get coffee',
      done: false,
      volumeAudio: 0.5,
    });
  });

  it('#1 should be resolved promise when store state has changed', async () => {
    expect.assertions(1);

    const promise = waitPatchStore(todo, { timeout: 0 });

    todo.toggle();

    return expect(promise).resolves.toBe(undefined);
  });

  it('#2 should be rejected promise when store state has not changed', async () => {
    expect.assertions(1);

    const promise = waitPatchStore(todo, { timeout: 0 });

    await expect(promise).rejects.toEqual(new Error('Timeout is ended'));
  });

  it('#3 should be resolved promise when property state has changed', async () => {
    expect.assertions(2);

    const correctPromise = waitPatchStore(todo, {
      timeout: 0,
      propertyName: 'done',
    });

    todo.toggle();

    await expect(correctPromise).resolves.toBe(undefined);

    const incorrectPromise = waitPatchStore(todo, {
      timeout: 0,
      propertyName: 'done',
    });

    todo.setVolumeAudio(1);

    await expect(incorrectPromise).rejects.toEqual(new Error('Timeout is ended'));
  });

  it('#4 should be resolved promise when property state has equal propertyValue', async () => {
    expect.assertions(1);

    const correctPromise = waitPatchStore(todo, {
      timeout: 0,
      propertyName: 'volumeAudio',
      propertyValue: 1,
    });

    todo.setVolumeAudio(1);

    await expect(correctPromise).resolves.toBe(undefined);
  });
});
