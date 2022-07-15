/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useEffect } from 'react';
import debounce from 'lodash/debounce';

type TFunctionDebounced = { (): any; cancel: () => void };

const useMemoizedDebounce = (func: () => any, delay: number, deps?: any[]) => {
  const resultFunc = useMemo<TFunctionDebounced>(() => {
    return debounce(func, delay);
  }, deps);

  useEffect(() => {
    return () => {
      resultFunc.cancel();
    };
  }, []);

  return resultFunc;
};

export default useMemoizedDebounce;
