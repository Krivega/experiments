import { debounce } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';

type TRefWithScroll = {
  scrollToBottom: () => void;
};

const DEBOUNCE_TIME = 300;

const useAutoScroll = (dependencies: unknown, debounceTime: number = DEBOUNCE_TIME) => {
  const ref = useRef<TRefWithScroll>(null);

  const scrollToBottom = useCallback(() => {
    if (ref.current) {
      ref.current.scrollToBottom();
    }
  }, []);

  useEffect(() => {
    const scrollToBottomDebounced = debounce(scrollToBottom, debounceTime);

    scrollToBottomDebounced();

    return () => {
      scrollToBottomDebounced.cancel();
    };
  }, [dependencies, debounceTime, scrollToBottom]);

  return { ref };
};

export default useAutoScroll;
