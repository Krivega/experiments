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

const DatePicker = ({ getValue, onChange, label, testid }: TProps) => {
  const locale = getLocale();

  const handleChange = useCallback(
    (date: string) => {
      const currentDate = new Date(getValue());
      const selectedDate = new Date(Date.parse(date));

      const merged = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        currentDate.getHours(),
        currentDate.getMinutes(),
        currentDate.getSeconds(),
        currentDate.getMilliseconds(),
      );

      onChange(merged.getTime());
    },
    [getValue, onChange],
  );

  return (
    <DatePickerUI
      label={label}
      locale={locale}
      testid={testid}
      value={getValue()}
      onChange={handleChange}
    />
  );
};

export default observer(DatePicker);
