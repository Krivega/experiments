/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useEffect } from 'react';
import debounce from 'lodash/debounce';

const useMemoizedDebounce = <T extends (...args: any) => any>(
  func: T,
  delay: number,
  deps?: any[]
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
