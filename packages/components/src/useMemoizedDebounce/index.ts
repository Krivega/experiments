/* eslint-disable react-hooks/exhaustive-deps */
import debounce from 'lodash/debounce';
import { useEffect, useMemo } from 'react';

const useMemoizedDebounce = <T extends (...args: any) => any>(
  func: T,
  delay: number,
  deps?: any[],
) => {
  const resultFunc = useMemo(() => {
    return debounce<T>(func, delay);
  }, deps);

  useEffect(() => {
    return () => {
      resultFunc.cancel();
    };
  }, []);

  return resultFunc;
};

export default useMemoizedDebounce;
