import { resolveSetter } from '@experiments/mst-tools';
import { types as typesMST } from 'mobx-state-tree';

import type { TInstanceModel } from '@experiments/mst-tools';

const ModelAction = typesMST
  .model({
    isActionInProgress: typesMST.optional(typesMST.boolean, false),
  })
  .actions((self) => {
    const resolveSelfSetter = resolveSetter(self);
    const setIsActionInProgress = resolveSelfSetter('isActionInProgress');

    const startAction = () => {
      setIsActionInProgress(true);
    };

    const endAction = () => {
      setIsActionInProgress(false);
    };

    return {
      startAction,
      endAction,
    };
  });

export type TInstanceAction = TInstanceModel<typeof ModelAction>;

export default ModelAction;
