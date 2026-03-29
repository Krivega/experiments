import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker as MuiTimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/ru';
import 'dayjs/locale/vi';
import 'dayjs/locale/zh-cn';

import { mapAppLocaleToDayjs } from './mapAppLocaleToDayjs';

import type { TextFieldProps } from '@mui/material/TextField';
import type { Dayjs } from 'dayjs';
import type { FC } from 'react';

export type TDatePickerProps = {
  label: string;
  locale: string;
  testid: string;
  value: number;
  onChange: (date: string) => void;
  /** When set, renders a time-only field (24h). */
  isTimeSelectOnly?: boolean;
  dateFormat?: string;
  timeFormat?: string;
};

const textFieldSlot = (testid: string): Partial<TextFieldProps> => {
  return {
    inputProps: { 'data-testid': testid },
  };
};

const DatePicker: FC<TDatePickerProps> = ({
  label,
  locale,
  testid,
  value,
  onChange,
  isTimeSelectOnly,
  dateFormat,
  timeFormat,
}) => {
  const adapterLocale = mapAppLocaleToDayjs(locale);
  const dayjsValue = dayjs(value);

  const handleChange = (newValue: Dayjs | null) => {
    if (newValue === null) {
      return;
    }

    if (!newValue.isValid()) {
      return;
    }

    onChange(newValue.toISOString());
  };

  const isTimeOnly = Boolean(isTimeSelectOnly);
  const timeDisplayFormat = timeFormat ?? dateFormat ?? 'HH:mm';

  return (
    <LocalizationProvider adapterLocale={adapterLocale} dateAdapter={AdapterDayjs}>
      {isTimeOnly ? (
        <MuiTimePicker
          ampm={false}
          format={timeDisplayFormat}
          label={label}
          slotProps={{ textField: textFieldSlot(testid) }}
          value={dayjsValue}
          onChange={handleChange}
        />
      ) : (
        <MuiDatePicker
          label={label}
          slotProps={{ textField: textFieldSlot(testid) }}
          value={dayjsValue}
          onChange={handleChange}
        />
      )}
    </LocalizationProvider>
  );
};

export default DatePicker;
