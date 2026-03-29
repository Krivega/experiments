import { DatePicker as DatePickerUI } from '@experiments/components';
import { observer } from 'mobx-react';
import { useCallback } from 'react';

import { getLocale } from '../translations';

type TProps = {
  getValue: () => number;
  onChange: (value: number) => void;
  label: string;
  testid: string;
};

const TimePicker = ({ getValue, onChange, label, testid }: TProps) => {
  const locale = getLocale();

  const handleChange = useCallback(
    (date: string) => {
      const currentDate = new Date(getValue());
      const selectedDate = new Date(Date.parse(date));

      const merged = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        selectedDate.getHours(),
        selectedDate.getMinutes(),
        selectedDate.getSeconds(),
        selectedDate.getMilliseconds(),
      );

      onChange(merged.getTime());
    },
    [getValue, onChange],
  );

  return (
    <DatePickerUI
      isTimeSelectOnly
      dateFormat="HH:mm"
      label={label}
      locale={locale}
      testid={testid}
      timeFormat="HH:mm"
      value={getValue()}
      onChange={handleChange}
    />
  );
};

export default observer(TimePicker);
