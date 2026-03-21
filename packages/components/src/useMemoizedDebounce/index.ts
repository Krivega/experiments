/* eslint-disable react-hooks/exhaustive-deps */
import debounce from 'lodash/debounce';
import { useEffect, useMemo } from 'react';

import type { DependencyList } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFunctionDebounced = { (): any; cancel: () => void };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useMemoizedDebounce = (function_: () => any, delay: number, deps: DependencyList) => {
  const resultFunction = useMemo<TFunctionDebounced>(() => {
    return debounce(function_, delay);
  }, deps);

  useEffect(() => {
    return () => {
      resultFunction.cancel();
    };
  }, []);

  return resultFunction;
};

export default useMemoizedDebounce;
