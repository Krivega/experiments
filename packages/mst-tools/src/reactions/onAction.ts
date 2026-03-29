import { onAction as onActionMST } from 'mobx-state-tree';

import type { IAnyStateTreeNode } from 'mobx-state-tree';

const onAction = (
  instance: IAnyStateTreeNode,
  callback: (parameters: unknown) => void,
  {
    actionName,
    targetPath,
    isRootPath = false,
    isAttachAfter = false,
  }: {
    actionName: string;
    targetPath?: string;
    isRootPath?: boolean;
    isAttachAfter?: boolean;
  },
) => {
  return onActionMST(
    instance,
    (call) => {
      const isMathByName = call.name === actionName;

      let isMatchByPath = targetPath === undefined ? true : call.path === targetPath;

      if (isRootPath) {
        isMatchByPath = call.path === '' || call.path === undefined;
      }

      if (isMathByName && isMatchByPath) {
        // @ts-expect-error
        const parameters = call.args[0] as unknown;

        callback(parameters);
      }
    },
    isAttachAfter,
  );
};

export default onAction;
