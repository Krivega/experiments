import { reaction } from 'mobx';

import type { IReactionOptions, IReactionPublic } from 'mobx';

type ConditionFunctionType<T> = (T: Parameters<Parameters<typeof reaction>[0]>[0]) => T;
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
type TActionPreviousEffect = (() => void) | void;
// eslint-disable-next-line @typescript-eslint/max-params
type EffectFunctionType = (
  argument: unknown,
  previous: unknown,
  r: IReactionPublic,
  actionPreviousEffect?: TActionPreviousEffect,
) => TActionPreviousEffect | undefined;

const whenElseAlways = <T, FireImmediately extends boolean = false>(
  conditionFunction: ConditionFunctionType<T>,
  effectFunction: EffectFunctionType,
  effectFunctionElse: EffectFunctionType,
  options?: IReactionOptions<T, FireImmediately>,
  // eslint-disable-next-line @typescript-eslint/max-params
) => {
  let actionEffectFunction: TActionPreviousEffect | undefined;
  let actionEffectFunctionElse: TActionPreviousEffect | undefined;

  return reaction<T, FireImmediately>(
    conditionFunction,
    (value, previousValue, reactionDisposer) => {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (value) {
        actionEffectFunction = effectFunction(
          value,
          previousValue,
          reactionDisposer,
          actionEffectFunctionElse,
        );
      } else {
        actionEffectFunctionElse = effectFunctionElse(
          value,
          previousValue,
          reactionDisposer,
          actionEffectFunction,
        );
      }
    },
    options,
  );
};

export default whenElseAlways;
