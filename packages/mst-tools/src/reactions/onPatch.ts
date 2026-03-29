import { onPatch as onPatchMST } from 'mobx-state-tree';

import type { IAnyStateTreeNode } from 'mobx-state-tree';

const onPatch = (
  instance: IAnyStateTreeNode,
  callback: (parameters: unknown) => void,
  {
    operationName,
    pathRegExp,
  }: {
    operationName: 'add' | 'remove' | 'replace';
    pathRegExp: string;
  },
) => {
  const hasMatchByPath = (path: string): boolean => {
    const matches = path.match(pathRegExp);

    return !!matches && matches.length === 1;
  };

  return onPatchMST(instance, (patch) => {
    const isMathByName = patch.op === operationName;
    const isMatchByPath = hasMatchByPath(patch.path);

    if (isMathByName && isMatchByPath) {
      const parameters = patch.value as unknown;

      callback(parameters);
    }
  });
};

export default onPatch;
