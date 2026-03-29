import type {
  IAnyModelType,
  IAnyType,
  IArrayType,
  IMSTArray,
  IStateTreeNode,
  Instance,
} from 'mobx-state-tree';

const resolveReplacer = <I extends IAnyModelType>(instance: Instance<I>) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  return <V extends IAnyType>(name: keyof typeof instance) => {
    return (value: V['Type'][]) => {
      const array = instance[name] as IMSTArray<V> & IStateTreeNode<IArrayType<V>>;

      array.replace(value);
    };
  };
};

export default resolveReplacer;
