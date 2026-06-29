import { useState } from 'react';
import { Calendar } from './Calendar';
import { useCalendarAdapter } from '../core/calendarAdapter';
import { selectSingleDate } from '../core/selection';
import '../styles.css';

export type DatePickerProps = {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
};

export function DatePicker({ value, defaultValue = null, onChange }: DatePickerProps = {}) {
  const adapter = useCalendarAdapter();
  const [visibleMonth, setVisibleMonth] = useState(() => value ?? defaultValue ?? adapter.today());
  const [uncontrolledSelectedDate, setUncontrolledSelectedDate] = useState<Date | null>(defaultValue);
  const isControlled = value !== undefined;
  const selectedDate = isControlled ? value : uncontrolledSelectedDate;

  const selectDate = (date: Date) => {
    const nextDate = selectSingleDate(date);

    if (!isControlled) {
      setUncontrolledSelectedDate(nextDate);
    }

    onChange?.(nextDate);
  };

  return (
    <div style={{direction: adapter.direction}} className="adp-picker">
      <Calendar
        month={visibleMonth}
        onMonthChange={setVisibleMonth}
        onDateSelect={selectDate}
        getDayState={(date) => ({ selected: adapter.isSameDay(date, selectedDate) })}
      />
      <div className="adp-selection-label">Selected date: {adapter.formatInputDate(selectedDate) || 'None'}</div>
    </div>
  );
}
