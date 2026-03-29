import { resolveSetter } from '@experiments/mst-tools';
import { types } from 'mobx-state-tree';

import type { TInstanceModel } from '@experiments/mst-tools';

const ModelCounter = types
  .model('ModelCounter', {
    count: types.number,
    initialCount: types.number,
    limit: types.number,
  })
  .views((self) => {
    return {
      hasLimitReached(): boolean {
        return self.count >= self.limit;
      },
    };
  })
  .actions((self) => {
    const resolveSelfSetter = resolveSetter(self);
    const setCount = resolveSelfSetter('count');

    return {
      increment() {
        if (self.count < self.limit) {
          setCount(self.count + 1);
        }
      },
      reset() {
        setCount(self.initialCount);
      },
    };
  });

export type TCounterStore = TInstanceModel<typeof ModelCounter>;

export default ModelCounter;
