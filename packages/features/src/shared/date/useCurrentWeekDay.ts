import { useMemo } from 'react';

import { WEEK_DAYS_ENGLISH_ORDER } from './constants';

type TWeekDay = (typeof WEEK_DAYS_ENGLISH_ORDER)[number];

// сохраняем день недели в момент первого рендера
// не обновляемся при смене даты
const useCurrentWeekDay = (): TWeekDay => {
  return useMemo(() => {
    const indexWeekDay = new Date().getDay();

    return WEEK_DAYS_ENGLISH_ORDER[indexWeekDay];
  }, []);
};

export default useCurrentWeekDay;
