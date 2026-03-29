import { destroy } from 'mobx-state-tree';

import type {
  IAnyModelType,
  IMSTMap,
  IMapType,
  Instance,
  IStateTreeNode,
  ReferenceIdentifier,
} from 'mobx-state-tree';
import type { TModelWithId } from '../types';

const resolveRemoveNonExistent = <I extends IAnyModelType>(instance: Instance<I>) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  return <TItem extends TModelWithId>(name: keyof typeof instance) => {
    return (valueTargets: TItem[]) => {
      const map = instance[name] as IMSTMap<IAnyModelType & TItem> &
        IStateTreeNode<IMapType<IAnyModelType & TItem>>;

      const idSet = new Set<ReferenceIdentifier>(
        valueTargets.map((t) => {
          return t.id;
        }),
      );

      const toDestroy: IStateTreeNode[] = [];

      map.forEach((item) => {
        if (!idSet.has(item.id as ReferenceIdentifier)) {
          toDestroy.push(item);
        }
      });

      toDestroy.forEach((item) => {
        destroy(item);
      });
    };
  };
};

const resolveAdd = <I extends IAnyModelType>(instance: Instance<I>) => {
  return (name: keyof typeof instance) => {
    return (valueTarget: TModelWithId) => {
      const map = instance[name] as IMSTMap<IAnyModelType & TModelWithId> &
        IStateTreeNode<IMapType<IAnyModelType & TModelWithId>>;

      map.set(valueTarget.id, valueTarget);
    };
  };
};

const resolveUpdate = <I extends IAnyModelType>(instance: Instance<I>) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  return <TItem extends TModelWithId>(name: keyof typeof instance) => {
    return (valueTarget: TModelWithId) => {
      const map = instance[name] as IMSTMap<IAnyModelType & TItem> &
        IStateTreeNode<IMapType<IAnyModelType & TModelWithId>>;

      const current = map.get(valueTarget.id);

      if (current === undefined) {
        map.set(valueTarget.id, valueTarget);
      } else {
        map.set(valueTarget.id, { ...current, ...valueTarget });
      }
    };
  };
};

const resolveUpdateMap = <I extends IAnyModelType>(instance: Instance<I>) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  return <TItem extends TModelWithId>(name: keyof typeof instance) => {
    const removeNonExistentByName = resolveRemoveNonExistent<I>(instance);
    const removeNonExistent = removeNonExistentByName<TItem>(name);
    const resolveAddByName = resolveAdd<I>(instance);
    const add = resolveAddByName(name);
    const resolveUpdateByName = resolveUpdate<I>(instance);
    const update = resolveUpdateByName<TItem>(name);

    return (valueTargets: TItem[]) => {
      removeNonExistent(valueTargets);

      const map = instance[name] as IMSTMap<IAnyModelType & TItem> &
        IStateTreeNode<IMapType<IAnyModelType & TItem>>;

      valueTargets.forEach((valueTarget) => {
        const isExistValue = map.has(valueTarget.id);

        if (isExistValue) {
          update(valueTarget);

          return;
        }

        add(valueTarget);
      });
    };
  };
};

export default resolveUpdateMap;
