import { reaction } from 'mobx';

import type { IReactionOptions, IReactionPublic } from 'mobx';

type ConditionFunctionType<T> = (T: Parameters<Parameters<typeof reaction>[0]>[0]) => T;

const whenAlways = <T, FireImmediately extends boolean = false>(
  conditionFunction: ConditionFunctionType<T>,
  effectFunction: (
    value: NonNullable<T>,
    previousValue: FireImmediately extends true ? T | undefined : T,
    reactionDisposer: IReactionPublic,
  ) => void,
  options?: IReactionOptions<T, FireImmediately>,
) => {
  return reaction<T, FireImmediately>(
    conditionFunction,
    (value, previousValue, reactionDisposer) => {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (value) {
        effectFunction(value, previousValue, reactionDisposer);
      }
    },
    options,
  );
};

export default whenAlways;
