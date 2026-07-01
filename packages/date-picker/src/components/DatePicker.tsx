import { useState } from 'react';
import { Calendar, type RenderCalendarDay } from './Calendar';
import { useCalendarAdapter } from '../core/calendarAdapter';
import { selectSingleDate } from '../core/selection';
import '../styles.css';

export type DatePickerProps = {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  renderDay?: RenderCalendarDay;
  minDate?: Date;
  maxDate?: Date;
};

export function DatePicker({ value, defaultValue = null, onChange, renderDay, minDate, maxDate }: DatePickerProps = {}) {
  const adapter = useCalendarAdapter();
  const [visibleMonth, setVisibleMonth] = useState(() => value ?? defaultValue ?? adapter.today());
  const [uncontrolledSelectedDate, setUncontrolledSelectedDate] = useState<Date | null>(defaultValue);
  const isControlled = value !== undefined;
  const selectedDate = isControlled ? value : uncontrolledSelectedDate;
  const constrainedVisibleMonth = adapter.constrainMonth(visibleMonth, 1, minDate, maxDate);

  const selectDate = (date: Date) => {
    if (adapter.isDateDisabled(date, minDate, maxDate)) {
      return;
    }

    const nextDate = selectSingleDate(date);

    if (!isControlled) {
      setUncontrolledSelectedDate(nextDate);
    }

    onChange?.(nextDate);
  };

  return (
    <div style={{direction: adapter.direction}} className="adp-picker">
      <Calendar
        month={constrainedVisibleMonth}
        onMonthChange={(month) => setVisibleMonth(adapter.constrainMonth(month, 1, minDate, maxDate))}
        onDateSelect={selectDate}
        getDayState={(date) => ({ selected: adapter.isSameDay(date, selectedDate) })}
        isDateDisabled={(date) => adapter.isDateDisabled(date, minDate, maxDate)}
        canNavigatePrev={adapter.canNavigateMonth(constrainedVisibleMonth, -1, 1, minDate, maxDate)}
        canNavigateNext={adapter.canNavigateMonth(constrainedVisibleMonth, 1, 1, minDate, maxDate)}
        renderDay={renderDay}
      />
    </div>
  );
}
