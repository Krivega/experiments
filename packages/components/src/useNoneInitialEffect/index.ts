import type { DependencyList, EffectCallback } from 'react';
import { useEffect, useRef } from 'react';

const useNonInitialEffect = (effect: EffectCallback, deps?: DependencyList) => {
  const initialRender = useRef(true);

  useEffect(() => {
    let effectReturns: ReturnType<EffectCallback> = () => {};

    if (initialRender.current) {
      initialRender.current = false;
    } else {
      effectReturns = effect();
    }

    return effectReturns;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useNonInitialEffect;
