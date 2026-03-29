import resolveSetter from '../resolveSetter';

import type {
  ModelInstanceTypeProps,
  ModelProperties,
  SnapshotOrInstance,
  SnapshotOut,
} from 'mobx-state-tree';
import type { TInstanceModel } from '../types';

const resolveDefinedSetter = <Instance extends ModelInstanceTypeProps<ModelProperties>>(
  instance: TInstanceModel<Instance>,
) => {
  const baseSetter = resolveSetter(instance);

  type ModelKeys = keyof SnapshotOut<Instance>;
  type KeysWithCustom<Custom> = Custom extends keyof Instance ? Custom | ModelKeys : ModelKeys;

  return <
    CustomKey extends string,
    Key extends KeysWithCustom<CustomKey> = KeysWithCustom<CustomKey>,
  >(
    name: Key,
  ) => {
    const setValue = baseSetter(name);

    return (value: SnapshotOrInstance<Instance>[Key] | SnapshotOut<Instance>[Key]): void => {
      // Не записываем данные, если значение undefined
      if (value === undefined) {
        return;
      }

      setValue(value);
    };
  };
};

export default resolveDefinedSetter;
