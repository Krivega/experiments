import { addMiddleware as addMiddlewareMST } from 'mobx-state-tree';

import type { IAnyStateTreeNode, IMiddlewareEventType } from 'mobx-state-tree';

const onMiddleware = (
  instance: IAnyStateTreeNode,
  callback: (parameters: unknown) => void,
  {
    actionName,
    type,
  }: {
    actionName: string;
    type: IMiddlewareEventType;
  },
) => {
  return addMiddlewareMST(instance, (call, next) => {
    const isMatchByName = call.name === actionName;
    const isMatchByType = call.type === type;

    if (isMatchByName && isMatchByType) {
      const parameters = call.args[0] as unknown;

      callback(parameters);
    }

    next(call);
  });
};

export default onMiddleware;
