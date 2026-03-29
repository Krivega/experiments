import type {
  ModelInstanceTypeProps,
  ModelProperties,
  SnapshotOrInstance,
  SnapshotOut,
} from 'mobx-state-tree';
import type { TInstanceModel } from '../types';

const resolveSetter = <Instance extends ModelInstanceTypeProps<ModelProperties>>(
  instance: TInstanceModel<Instance>,
) => {
  type ModelKeys = keyof SnapshotOut<Instance>;

  type KeysWithCustom<Custom> = Custom extends keyof Instance ? Custom | ModelKeys : ModelKeys;

  return <
    CustomKey extends string,
    Key extends KeysWithCustom<CustomKey> = KeysWithCustom<CustomKey>,
  >(
    name: Key,
  ) => {
    return (value: SnapshotOrInstance<Instance>[Key] | SnapshotOut<Instance>[Key]): void => {
      if (Array.isArray(value)) {
        // eslint-disable-next-line no-console
        console.warn(
          `[mst-tools] resolveSetter: значение для поля "${String(name)}" является массивом. В MST 7 прямое присваивание массива (self[field] = value) может приводить к reconcile in-place и не всегда корректно инвалидировать derived, основанные на shallow-чтениях. Лучше использовать resolveReplacer (array.replace(value)) для таких полей.`,
        );
      }

      // eslint-disable-next-line no-param-reassign
      instance[name] = value;
    };
  };
};

export default resolveSetter;
