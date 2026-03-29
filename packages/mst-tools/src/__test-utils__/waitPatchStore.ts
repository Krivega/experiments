import { onPatch } from 'mobx-state-tree';

import type { IAnyModelType, IJsonPatch, Instance } from 'mobx-state-tree';

const DEFAULT_RACE_TIMEOUT = 1000 as const;

const hasMatchedProperty = ({
  path,
  propertyName,
}: {
  path: string;
  propertyName: string;
}): boolean => {
  return path === `/${propertyName}`;
};

const waitPatchStore = async <M extends IAnyModelType>(
  storeInstance: Instance<M>,
  {
    propertyValue,
    timeout = DEFAULT_RACE_TIMEOUT,
    propertyName = '',
  }: { timeout?: number; propertyName?: string; propertyValue?: Instance<M> } = {},
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const timerId = setTimeout(() => {
      reject(new Error('Timeout is ended'));
    }, timeout);

    onPatch(storeInstance, ({ path, value }: IJsonPatch) => {
      const isValidPropertyName = !propertyName || hasMatchedProperty({ path, propertyName });
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      const isValidPropertyValue = !propertyValue || propertyValue === value;

      if (isValidPropertyName && isValidPropertyValue) {
        clearTimeout(timerId);
        resolve();
      }
    });
  });
};

export default waitPatchStore;
