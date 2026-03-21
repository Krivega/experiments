import * as React from 'react';

import type { DependencyList, EffectCallback } from 'react';

const useNoneInitialEffect = (effect: EffectCallback, deps?: DependencyList) => {
  const initialRender = React.useRef(true);

  React.useEffect(() => {
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

export default useNoneInitialEffect;
