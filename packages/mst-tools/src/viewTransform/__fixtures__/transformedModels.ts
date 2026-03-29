import { types } from 'mobx-state-tree';

import resolveSetter from '../../resolveSetter';
import viewTransform from '../viewTransform';

import type { TInitialState } from '../../types';

class CallCounter {
  private countInner = 0;

  public get count() {
    return this.countInner;
  }

  public increase() {
    this.countInner += 1;
  }

  public reset() {
    this.countInner = 0;
  }
}

export const itemsCallCounter = new CallCounter();

const ItemModel = types
  .model('Item', {
    id: types.identifier,
    name: types.string,
  })
  .actions((self) => {
    const selfSetter = resolveSetter(self);
    const setName = selfSetter('name');

    return {
      setName,
    };
  });

const ItemsModel = types
  .model('Items', {
    itemsMap: types.optional(types.map(ItemModel), {}),
    itemsArray: types.optional(types.array(ItemModel), []),
  })
  .actions((self) => {
    const setMapItem = (item: TInitialState<typeof ItemModel>) => {
      self.itemsMap.set(item.id, item);
    };

    const clearMapItems = () => {
      self.itemsMap.clear();
    };

    const setArrayItem = (item: TInitialState<typeof ItemModel>) => {
      self.itemsArray.push(item);
    };

    const clearArrayItems = () => {
      self.itemsArray.clear();
    };

    return {
      setMapItem,
      clearMapItems,
      setArrayItem,
      clearArrayItems,
    };
  });

export const TransformedItemsModel = ItemsModel.views((self) => {
  const transformItemsMap = viewTransform((itemsMap: typeof self.itemsMap) => {
    itemsCallCounter.increase();

    return [...itemsMap.values()];
  });

  const transformItemsArray = viewTransform((itemsArray: typeof self.itemsArray) => {
    itemsCallCounter.increase();

    return [...itemsArray.values()];
  });

  return {
    get transformedMapItems() {
      return transformItemsMap(self.itemsMap);
    },

    get transformedArrayItems() {
      return transformItemsArray(self.itemsArray);
    },
  };
});
