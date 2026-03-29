import { getSnapshot, types } from 'mobx-state-tree';

import type { TExtractType } from '@experiments/mst-tools';
import type { IAnyType } from 'mobx-state-tree';

const createQueue = <T extends IAnyType>(QueueItem: T) => {
  type TItem = TExtractType<T>;

  const cloneQueueItem = (item: TItem): TItem => {
    const snapshot = getSnapshot(item);

    return QueueItem.create(snapshot);
  };

  return types
    .model({
      items: types.array(QueueItem),
    })
    .views((self) => {
      return {
        //  возвращает количество элементов в очереди
        get size(): number {
          return self.items.length;
        },
        get isEmpty(): boolean {
          return this.size === 0;
        },
        // берёт элемент из начала очереди без удаления
        get peek(): TItem | undefined {
          return self.items.length > 0 ? self.items[0] : undefined;
        },
      };
    })
    .actions((self) => {
      return {
        // добавляет элемент в конец очереди
        push(value: TItem) {
          self.items.push(value);
        },
        // берёт элемент из начала очереди и удаляет его
        pop(): TItem | undefined {
          const queueItem = self.peek;

          if (queueItem === undefined) {
            return undefined;
          }

          const clonedQueueItem = cloneQueueItem(queueItem);

          self.items.shift();

          return clonedQueueItem;
        },
        clear(): void {
          self.items.clear();
        },
      };
    });
};

export default createQueue;
