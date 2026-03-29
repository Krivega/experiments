import { types } from 'mobx-state-tree';

const createFunctionType = <P extends unknown[] = []>() => {
  type TFunction = (...arguments_: P) => void;

  const functionType = types.custom({
    name: 'functionType',
    fromSnapshot(function_: TFunction) {
      return (...arguments_: P) => {
        function_(...arguments_);
      };
    },
    toSnapshot(function_: TFunction) {
      return () => {
        return function_.toString();
      };
    },
    isTargetType(function_: TFunction | undefined) {
      return typeof function_ === 'function';
    },
    getValidationMessage(function_: TFunction | undefined) {
      if (typeof function_ === 'function') {
        return '';
      }

      return `'${function_}' doesn't look like a valid function`;
    },
  });

  return functionType;
};

export default createFunctionType;
