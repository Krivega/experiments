import { useCallback, useState } from 'react';

export const useBoolean = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((previous) => {
      return !previous;
    });
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return [value, toggle, setValue, reset];
};
