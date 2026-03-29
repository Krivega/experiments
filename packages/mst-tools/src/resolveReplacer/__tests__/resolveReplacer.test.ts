/// <reference types="jest" />
import { types } from 'mobx-state-tree';

import resolveReplacer from '../index';

describe('resolveReplacer', () => {
  const Model = types.model({ items: types.array(types.number) }).actions((self) => {
    const resolveSelfReplacer = resolveReplacer(self);
    const replaceItems = resolveSelfReplacer<typeof types.number>('items');

    return {
      replaceItems,
    };
  });

  it('should replace array', () => {
    const instance = Model.create();

    instance.replaceItems([1, 2, 3]);

    expect(instance.items).toEqual([1, 2, 3]);
  });
});
